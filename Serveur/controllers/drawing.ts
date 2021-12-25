import { NextFunction, Request, Response } from 'express';
import { Drawing } from '../classes/drawing';
import { Room } from '../classes/room';
import { EllipseClass } from '../classes/shapes/ellipse';
import { LineClass } from '../classes/shapes/line';
import { RectangleClass } from '../classes/shapes/rectangle';
import { VectorObjectClass } from '../classes/shapes/vectorObject';
import { User } from '../classes/user';
import logging from '../config/logging';
import { Privacy } from '../Enum/privacy';
import { uploadFile } from '../functions/firebase';
import { IDrawing } from '../interfaces/drawing/drawing';
import { Line } from '../interfaces/drawing/line';
import { TypedShape } from '../interfaces/drawing/shape';
import { VectorObject } from '../interfaces/drawing/vectorObject';
import { IMessage } from '../interfaces/IMessage';
import { IResponse } from '../interfaces/IResponse';
import user from '../models/user';
import ChatService from '../services/chatService';
import commandControllerService from '../services/commandControllerService';
import DatabaseService from '../services/databaseService';
import drawingService from '../services/drawingService';
import socketService from '../services/socketService';
import userService, { action, status } from '../services/UserService';
import * as http_status from '../utils/HTTP-Codes';
import { uuidv4 } from '../utils/uuidV4';

const NAMESPACE = "Drawing queries";
const AUTHORIZED = "Authorized";
const UNAUTHORIZED = "Unauthorized";
const SOCKET_ROOM_PREFIX = "DRAWING_";
const SOCKET_CHATROOM_PREFIX = "ROOM_DRAWING_";

const create_drawing = async (req: Request, res: Response, next: NextFunction) => {
    
    const param = req.body

    let name = param.drawing
    let owner = param.owner
    let privacy:Privacy = param.privacy;
    let password = param.password;
    let team = param.team;
    let timestamp = Date.now() / 1000;
    let objects = [{
        id: "PLACEHOLDER",
        isSelected: false,
        z: 0,
        color: "#ff000000",
        strokeWidth: 0,
        matrix: {
            a: 1,
            b: 0,
            c: 0,
            d: 1,
            e: 0,
            f: 0
        },
        points: [{
            x: 0,
            y: 0
        }]
    } as Line];
    const preview = "https://firebasestorage.googleapis.com/v0/b/log3900-102.appspot.com/o/BLANK.jpeg?alt=media&token=8c033204-b298-4e0c-adaf-ed1838081ebf";
    if (name && owner && (privacy == Privacy.private || privacy == Privacy.protected || privacy == Privacy.public)) {
        if(drawingService.getDrawings().has(name)) {
            return res.status(404).json({
                title:UNAUTHORIZED,
                message: "Le dessin existe déjà."
            });
        }

        await DatabaseService.createDrawing(name, owner, privacy, timestamp, objects, preview, team, password)
        .then(async () => {
            let drawing = new Drawing({
                name                : name,
                owner               : owner,
                password            : password,
                creationTimestamp   : timestamp,
                privacy             : privacy,
                objects             : objects,
                preview             : preview,
                team                : team,
                version             : 0,
                versions            : 1,
                z               : 0
            });

            let email = userService.getUsers().get(owner)?.getEmail() as string
            DatabaseService.updateUserOwnership(email, name).then(() => {
                userService.getUsers().get(owner)?.addOwnership(name);
            
                drawingService.getDrawings().set(name, drawing);
            })

            const roomName = SOCKET_CHATROOM_PREFIX + name;

            let error = false;

            await DatabaseService.createRoom(roomName, owner, password)
            .then(() => {
                let room =  new Room(roomName, owner, new Array<IMessage>(), new Array<string>(), password);
                ChatService.getRooms().set(roomName, room);

                /** if private room, ne pas emit, else, emit que elle a ete creer */
                logging.info(NAMESPACE, "Room successfully created: [" + roomName  +"], Owner: [" + room.getOwner() + "]");

                // pour la add chez tout les clients
                socketService.getServer().emit("create_room", { room: roomName });
            })
            .catch ((err) => {
                error = true;
                return res.status(http_status.DATABASE_ERROR).json({
                    title : "Unauthorized",
                    message : err.message
                });
            })

            if (error) {
                return;
            }


            socketService.getServer().emit("new_drawing");

            return res.status(200).json({
                title:AUTHORIZED,
                message: "Drawing created successfully."
            });
        })
        .catch((error) => {
            return res.status(http_status.DATABASE_ERROR).json({
                title : UNAUTHORIZED,
                message : error
            });
        });
    } else {
        return res.status(404).json({
            title:UNAUTHORIZED,
            message: ("Données manquantes. Nous avons reçu: " + JSON.stringify(param))
        });
    }
};


const update_preview = async (req: Request, res: Response, next: NextFunction) => {
    const param = req.body
    let name = param.name;
    let preview = param.preview
    
    let objects = drawingService.getDrawings().get(name)?.getVectorObjectsInterface(true) as Array<VectorObject>;

    if(name && preview){
        let buffer = Buffer.from(preview)

        await uploadFile(name, buffer)
        .then(async (link) => {
            await DatabaseService.updateDrawing(name, objects, link).then((response) => {
                return res.status(200).json({
                    title:AUTHORIZED,
                    message: "Drawing updated successfully."
                });
            })
            .catch((err) => {
                console.log(err)
                return res.status(http_status.DATABASE_ERROR).json({
                    title: UNAUTHORIZED,
                    message: "Échec de l'enregistrement de l'aperçu.",
                    error: err
                })
            });
        })
        .catch((err) => {
            return res.status(http_status.DATABASE_ERROR).json({
                title: UNAUTHORIZED,
                message: "Échec de l'enregistrement de l'aperçu.",
                error: err
            })
        })


    }

}

const get_all_drawings = async (req: Request, res: Response, next: NextFunction) => {
    let array = new Array<any>();
    await DatabaseService.getAllDrawings().then((ans) => {
        ans.forEach((drawing) => {
            let user = userService.getUsers().get(drawing.owner);
            let email = " ";
            let firstname = " ";
            let lastname = " ";

            if(user?.getIsEmailPublic()){
                email = user.getEmail();
            }

            if(user?.getIsNamePublic()){
                firstname = user.getFirstname();
                lastname = user.getLastname();
            }
            array.push({
                creationTimestamp   : drawing.creationTimestamp,
                name                : drawing.name,
                objects             : [],
                owner               : drawing.owner,
                avatar              : userService.getUsers().get(drawing.owner)?.getAvatar(),
                password            : drawing.password,
                preview             : drawing.preview,
                privacy             : drawing.privacy,
                team                : drawing.team,
                nbCollaborateurs    : drawingService.getDrawings().get(drawing.name)?.getActiveUsers().length,
                version             : 0,
                versions            : 1,
                z                   : drawing.z,
                email               : email,
                firstname           : firstname,
                lastname            : lastname,
            })
        })
        res.status(200).json({
            drawings: array
        })
    }).catch((err)=>{
        return res.status(http_status.DATABASE_ERROR).json({
            title: UNAUTHORIZED,
            message: "Échec de l'obtention de tous les détails des dessins existants.",
            error: err
        })
    })
}

const get_drawing_data = async (req: Request, res: Response, next: NextFunction) => {
    const param = req.body

    let name = param.drawing;

    if (name) {
        let drawing = drawingService.getDrawings().get(name)
        if (drawing) {
            console.log(drawing.versions)
            res.status(200).json({
                drawing: {
                    creationTimestamp: drawing.getCreationTimestamp(),
                    name: drawing.getName(),
                    objects: drawing.getVectorObjectsInterface(false),
                    owner: drawing.getOwner(),
                    password: drawing.getPassword(),
                    preview: drawing.getPreview(),
                    privacy: 0,
                    team: drawing.getTeam(),
                    version: drawing.version,
                    versions: drawing.versions
                }
            })
        }
    }
    else {
        res.status(404).json({
            title: "Unauthorized",
            message: "Échec de l'obtention des détails du dessin."
        });
    }
}

const join_drawing = async (req: Request, res: Response, next: NextFunction) => {

    const params = req.body;

    let drawingName = params.drawing;
    let user = params.user;

    let drawings = drawingService.getDrawings();

    let socketID = userService.getSocketIDFromUser(user);

    const timestamp = Date.now()

    if (user && drawingName && socketID && drawings.has(drawingName)) {

        let drawing = drawings.get(drawingName);
        let socket = socketService.getServer().sockets.sockets.get(socketID);
        
        if(!drawing?.hasUser(user)) {

            if ((drawing?.getActiveUsers() as Array<string>).length > 3) {
                return res.status(http_status.DRAWING_MAX_USERS_LIMIT_REACHED).json({
                    title : UNAUTHORIZED,
                    message : "Limite atteinte : le dessin a déjà 4 utilisateurs actifs.",
                } as IResponse);
            }

            socket?.join(SOCKET_ROOM_PREFIX + drawingName);
            let email = userService.getUsers().get(user)?.getEmail() as string
            // Historique d'edition
            let user_ = userService.getUsers().get(user) as User
            user_.setHistoriqueEdition(drawingName);
            DatabaseService.updateUserHistoriqueEdition(email, drawingName);

            // collaborations
            if(!user_.getCollaborations().includes(drawingName)) {
                user_?.setCollaborations(drawingName);
                DatabaseService.updateUsercollaborations(email, drawingName);
            }

            // lastAction
            const newAction = {
                action: action.JOIN_DRAWING,
                timestamp: timestamp,
                drawing: drawingName
            };

            user_.addLastAction(newAction);
            DatabaseService.updateUserLastAction(email, newAction);

            user_.setDrawingJoinedTimeStamp(timestamp);
            
            userService.busyUser(user);

            socketService.getServer().emit('change_status', { user: user, status: status.BUSY });
            drawing?.connectUser(user);
            
            logging.info(NAMESPACE, "User [" + user +"] successfully joined the drawing [" + drawingName + "].");

            socketService.getServer().to(SOCKET_ROOM_PREFIX + drawingName).emit('join_drawing', { drawing : drawingName, user : user });

            const roomName = SOCKET_CHATROOM_PREFIX + drawingName;

            let error = false;

            await DatabaseService.addUserToRoom(roomName, user)
            .then(() => {

                socketService.getServer().sockets.sockets.get(socketID as string)?.join(roomName);

                let room = ChatService.getRooms().get(roomName);

                room?.AddUser(user);
                room?.connectUser(user);
                
                logging.info(NAMESPACE, "User [" + user +"] successfully joined the room [" + roomName + "].");

                socketService.getServer().to(roomName).emit('join_room', { room : roomName, user : user });
            })
            .catch((err) => {
                error = true;

                return res.status(http_status.DATABASE_ERROR).json({
                    title : "Unauthorized",
                    message : err.message
                });
            })

            if (error) {
                return;
            }

            return res.status(http_status.AUTHORIZED).json({
                title : AUTHORIZED,
                message : "Drawing joined successfully.",
                objects: drawing?.getVectorObjectsInterface(false),
                version: drawing?.version,
                versions: drawing?.versions
            } as IResponse);
        }
        
        else {
            logging.info(NAMESPACE, "User [" + user + "]" + "tried to join drawing [" + drawingName + "], but he is already in it.");
            return res.status(http_status.USER_ALREADY_IN_DRAWING).json({
                title : UNAUTHORIZED,
                message : "Utilisateur déjà dans le dessin."
            } as IResponse);
        }
    }

    else if (!drawings.has(drawingName) && drawingName) {
        logging.info(NAMESPACE, "User [" + user + "]" + "tried to join room [" + drawingName + "], but it wasn't found.");
        return res.status(http_status.DRAWING_DOESNT_EXIST).json({
            title : UNAUTHORIZED,
            message : "Le dessin n'existe pas."
        }  as IResponse);
    }
    
    else if (!drawingName) {
        logging.info(NAMESPACE, "User [" + user + "]" + "tried to join a drawing but the drawing name was not provided.");
        return res.status(http_status.DRAWING_NAME_NOT_PROVIDED).json({
            title : UNAUTHORIZED,
            message : "Le nom du dessin n'a pas été fourni."
        }  as IResponse);
    }
    
    else if (!user) {
        logging.info(NAMESPACE, "A user tried to join the drawing [" + drawingName +"]" + " but the username wasn't provided.");
        return res.status(http_status.USERNAME_NOT_PROVIDED).json({
            title : UNAUTHORIZED,
            message : "Le nom d'utilisateur n'a pas été fourni."
        } as IResponse);
    } 
    
    else if (!socketID){
        logging.info(NAMESPACE, "User [" + user + "]" + "tried to join the drawing [" + drawingName + "], but he wasn't connected to socket.");

        return res.status(http_status.USER_NOT_LOGGED_IN).json({
            title : UNAUTHORIZED,
            message : "Utilisateur non connecté."
        } as IResponse);
    }

}

const leave_drawing = async (req: Request, res: Response, next: NextFunction) => {
    const params = req.body;

    let drawingName = params.drawing;
    let user = params.user;
    let preview = params.preview;

    let drawings = drawingService.getDrawings();

    let socketID = userService.getSocketIDFromUser(user);



    if(user && drawingName && drawings.has(drawingName) && socketID) {

        let drawing = drawings.get(drawingName)
        let socket = socketService.getServer().sockets.sockets.get(socketID);
        if(drawing?.hasUser(user)) {

            let buffer = Buffer.from(preview)
            uploadFile("DRAWING_" + drawingName, buffer)
            .then(async (res) => {
                drawingService.getDrawings().get(drawingName)?.setPreview(res);
                DatabaseService.updatePreview(drawingName, res);
            })
            .catch((err) => {
                console.log(err);
            })

            userService.connectUser(user);

            let object = drawingService.getSelectedObjects().get(user);

            if (object) {
                drawingService.getSelectedObjects().delete(user);
                object[0].setIsSelected(false);

                socketService.getServer().in(SOCKET_ROOM_PREFIX + object[1])
                .emit('unselect', {
                    name: object[1],
                    user: user,
                    id: (object[0] as VectorObjectClass).getId()
                });
            }

            drawing?.disconnectUser(user);
            socket?.leave(SOCKET_ROOM_PREFIX + drawingName);
            socketService.getServer().emit('change_status', { user: user, status: status.CONNECTED });

            let startTime = userService.getUsers().get(user)?.getDrawingJoinedTimeStamp() as number;
            let endTime = Date.now();

            userService.getUsers().get(user)?.addTotalTimeCollab(endTime - startTime)
            DatabaseService.updateUserInfo(
                userService.getUsers().get(user)?.getEmail() as string,
                { totalTimeCollab: userService.getUsers().get(user)?.getTotalTimeCollab() }
            );

            // lastAction
            const newAction = {
                action: action.LEAVE_DRAWING,
                timestamp: endTime,
                drawing: drawingName
            };

            userService.getUsers().get(user)?.addLastAction(newAction);

            
            // TODO: A verifier si on le garde
            socketService.getServer().in(SOCKET_ROOM_PREFIX + drawingName).emit(
                'leave_drawing',
                {
                    drawing : drawingName,
                    users: [user]
                }
            );

            commandControllerService.addUser(params.user);

            // leave Team chatroom

            const roomName = SOCKET_CHATROOM_PREFIX + drawingName;

            let error = false;

            DatabaseService.removeUserFromRoom(roomName, user)
            .then(() => {
                logging.info(NAMESPACE, "User [" + user + "] successfully removed from Room [" + roomName + "].");

                let room = ChatService.getRooms().get(roomName);

                room?.disconnectUser(user);
                room?.deleteUser(user);

                let socketID = userService.getSocketIDFromUser(user);

                socketService.getServer().in(roomName).emit('leave_room', { room : roomName, users: [user] });

                socketService.getServer().sockets.sockets.get(socketID as string)?.leave(roomName);
                
            })
            .catch((err) => {
                error = true;

                return res.status(http_status.DATABASE_ERROR).json({
                    title : "Unauthorized",
                    message : err.message
                });
            })

            if (error) {
                return;
            }

            res.status(http_status.AUTHORIZED).json({
                title : AUTHORIZED,
                message : "User left successfully.",
            } as IResponse);

        } else {
            logging.info(NAMESPACE, "User [ " + user + "]" + "tried to leave drawing [" + drawingName + "], but he is not an active user.");
            res.status(http_status.USER_NOT_IN_DRAWING).json({
                title : UNAUTHORIZED,
                message : "User not in drawing.",
            } as IResponse);
        }
        
    }
    
    else if (!drawings.has(drawingName) && drawingName) {
        logging.info(NAMESPACE, "User [" + user + "]" + "tried to leave [" + drawingName + "], but it wasn't found.");

        return res.status(http_status.DRAWING_DOESNT_EXIST).json({
            title : UNAUTHORIZED,
            message : "Drawing doesn't exist."
        } as IResponse);
    }
    
    else if (!drawingName) {
        logging.info(NAMESPACE, "User [" + user + "]" + "tried to leave a drawing, but the drawing name was not provided.");

        return res.status(http_status.DRAWING_NAME_NOT_PROVIDED).json({
            title : UNAUTHORIZED,
            message : "Drawing name has not been provided."
        } as IResponse);
    }
    
    else if (!user) {
        logging.info(NAMESPACE, "A user tried to leave the drawing [" + drawingName +"]" + " but the username wasn't provided.");
        return res.status(http_status.USERNAME_NOT_PROVIDED).json({
            title : UNAUTHORIZED,
            message : "User name has not been provided."
        } as IResponse);
    }

    else if (!socketID){
        logging.info(NAMESPACE, "User [" + user + "]" + "tried to leave drawing [" + drawingName + "], but he wasn't connected to socket.");
        return res.status(http_status.USER_NOT_LOGGED_IN).json({
            title : UNAUTHORIZED,
            message : "User not loggedin"
        } as IResponse);
    }

}

const new_version = async (req: Request, res: Response, next: NextFunction) => {
    const params = req.body;

    let drawingName = params.drawing;
    let user = params.user;

    if(user && drawingName) {
        let drawing = drawingService.getDrawings().get(drawingName)
        // if(user == drawing?.getOwner()){
            if(drawing !== undefined) {
                await DatabaseService.new_version(drawing?.getName(), { objects : drawing?.getVectorObjectsInterface(true) }).then(()=>{
                    socketService.getServer().in(SOCKET_ROOM_PREFIX + drawingName).emit("new_version", { versions: drawing!.versions });
                    res.status(http_status.AUTHORIZED).json({
                        title : AUTHORIZED,
                        message : "Drawing version created successfully",
                    } as IResponse);
                })
            }
        // }

    } else if(!user) {
        return res.status(http_status.USERNAME_NOT_PROVIDED).json({
            title : UNAUTHORIZED,
            message : "User not provided"
        } as IResponse);
    } else if (!drawingName) {
        return res.status(http_status.DRAWING_NAME_NOT_PROVIDED).json({
            title : UNAUTHORIZED,
            message : "Drawing name not provided"
        } as IResponse);
    }
}

const swap_version = async (req: Request, res: Response, next: NextFunction) => {
    const params = req.body;

    let drawingName = params.drawing;
    let version = params.version;
    if (version !== undefined && drawingName) {
        
        let drawing = drawingService.getDrawings().get(drawingName) as Drawing;

        if (drawing && (version as number) <= (drawing.versions - 1)) {
            await drawing.saveDrawingDatabase()
            .then(async () => {
                await DatabaseService.get_version(drawingName, version as number)
                .then((vObject) => {
                    console.log(vObject);
                    let newDrawing = new Drawing({
                        name: drawing?.getName() as string,
                        owner: drawing?.getOwner() as string, 
                        password: drawing?.getPassword() as string,
                        creationTimestamp: drawing?.getCreationTimestamp() as number,
                        privacy: drawing?.getPrivacy() as Privacy,
                        objects: vObject as Array<VectorObject>,
                        preview: drawing.getPreview(),
                        team: drawing?.getTeam(),
                        version: version as number,
                        versions: drawing?.versions as number,
                        z: drawing.getLastZ()
                    });

                    drawing.getActiveUsers().forEach(user => {
                        newDrawing.connectUser(user);
                        commandControllerService.addUser(user);
                    });

                    drawingService.getDrawings().set(drawing?.getName() as string, newDrawing);
                    
                    // unselect objects
                    drawing.getActiveUsers().forEach(user => {
                        let objects = drawingService.getSelectedObjects().get(user);
                        if (objects) {
                            objects[0].setIsSelected(false);

                            const SOCKET_ROOMPREFIX = "DRAWING";
                            socketService.getServer().in(SOCKET_ROOM_PREFIX + drawing.getName())
                            .emit('unselect', {
                                name: drawing.getName(),
                                user: user,
                                id: objects[0].getId()
                            });
                            drawingService.getSelectedObjects().delete(user);
                        }
                    })

                    console.log('emitting')
                    socketService.getServer().in(SOCKET_ROOM_PREFIX + drawing?.getName()).emit("changed_version");

                    res.status(http_status.AUTHORIZED).json({
                        title : AUTHORIZED,
                        message : "Drawing version changed successfully",
                    } as IResponse);
                })
                .catch(err => {
                    res.status(http_status.DATABASE_ERROR).json({
                        title: UNAUTHORIZED,
                        message: "Failed to get version objects."
                    } as IResponse);
                })
            })
            .catch(err => {
                res.status(http_status.DATABASE_ERROR).json({
                    title: UNAUTHORIZED,
                    message: "failed to save"
                } as IResponse);
            })
        }
    }
}

const save = (req: Request, res: Response, next: NextFunction) => {
    const params = req.body;

    let drawingName = params.drawing;
    let user = params.user;

    if (user && drawingName) {
        let drawing = drawingService.getDrawings().get(drawingName);
        if (drawing !== undefined) {
            drawing?.saveDrawingDatabase();
            return res.status(http_status.AUTHORIZED).json({
                title : AUTHORIZED,
                message : "Drawing saved successfully",
            } as IResponse);
        } else {
            return res.status(http_status.DRAWING_NAME_NOT_PROVIDED).json({
                title : UNAUTHORIZED,
                message : "Drawing doesnt exist"
            } as IResponse);
        }
        // if(drawing !== undefined) {
        //     DatabaseService.save_current_version(drawing?.getName(), drawing?.getVectorObjectsInterface(true), drawing.version)
        //     .then(() => {
        //         res.status(http_status.AUTHORIZED).json({
        //             title : AUTHORIZED,
        //             message : "Drawing saved successfully",
        //         } as IResponse);
        //     }).catch((err) => {

        //         return res.status(http_status.DATABASE_ERROR).json({
        //             title : "Unauthorized",
        //             message : err.message
        //         });
        //     })
        // } else {
        //     return res.status(http_status.DRAWING_NAME_NOT_PROVIDED).json({
        //         title : UNAUTHORIZED,
        //         message : "Drawing doesnt exist"
        //     } as IResponse);
        // }
    } else if (!user) {
        return res.status(http_status.USERNAME_NOT_PROVIDED).json({
            title : UNAUTHORIZED,
            message : "User not provided"
        } as IResponse);
    } else if (!drawingName) {
        return res.status(http_status.DRAWING_NAME_NOT_PROVIDED).json({
            title : UNAUTHORIZED,
            message : "Drawing name not provided"
        } as IResponse);
    }
}
// delete drawing
// get all drawing que tu peux voir (owner)

export default
{
    create_drawing,
    update_preview,
    get_all_drawings,
    get_drawing_data,
    join_drawing,
    leave_drawing,
    new_version,
    save,
    swap_version,
    SOCKET_ROOM_PREFIX
};