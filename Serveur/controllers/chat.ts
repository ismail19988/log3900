import { NextFunction, raw, Request, Response } from 'express';
import logging from '../config/logging';
import userService from '../services/UserService';
import ChatService from '../services/chatService';
import socketService from '../services/socketService';
import { IRoom } from '../interfaces/chat/room';
import { Room } from '../classes/room';
import { IMessage } from '../interfaces/chat/IMessage';
import DatabaseService from '../services/databaseService';
import { IResponse } from '../interfaces/IResponse';
import * as status from '../utils/HTTP-Codes';

const NAMESPACE = "Chat queries";
const AUTHORIZED = "Authorized";
const UNAUTHORIZED = "Unauthorized";

/** creating new user & storing in DB */
const join_room = async (req: Request, res: Response, next: NextFunction) => {

    const params = req.body;

    let roomName = params.room;
    let user = params.user;

    let rooms = ChatService.getRooms();

    let socketID = userService.getSocketIDFromUser(user);

    if(user && roomName && socketID && rooms.has(roomName)) {

        let room = rooms.get(roomName);
        let socket = socketService.getServer().sockets.sockets.get(socketID);
        
        if(!room?.hasUser(user)) {

            // save in database
            await DatabaseService.addUserToRoom(roomName, user)
            .then(() => {

                socket?.join(roomName);
                room?.AddUser(user);
                room?.connectUser(user);
                
                logging.info(NAMESPACE, "User [" + user +"] successfully joined the room [" + roomName + "].");

                socketService.getServer().to(roomName).emit('join_room', { room : roomName, user : user });

                return res.status(status.AUTHORIZED).json({
                    title : AUTHORIZED,
                    message : "Room joined successfully.",
                } as IResponse);
            })
            .catch((error) => {
                logging.error(NAMESPACE, "database error " + error);
                return res.status(status.DATABASE_ERROR).json({
                    title : UNAUTHORIZED,
                    message : error
                });
            })
        }
        
        else {
            logging.info(NAMESPACE, "User [" + user + "]" + "tried to join room [" + roomName + "], but he was already in it.");
            return res.status(status.USER_ALREADY_IN_ROOM).json({
                title : UNAUTHORIZED,
                message : "User already in room."
            } as IResponse);
        }
    }

    else if(!rooms.has(roomName) && roomName) {
        logging.info(NAMESPACE, "User [" + user + "]" + "tried to join room [" + roomName + "], but it wasn't found.");
        return res.status(status.ROOM_DOESNT_EXIST).json({
            title : UNAUTHORIZED,
            message : "Room doesn't exist."
        }  as IResponse);
    }
    
    else if(!roomName) {
        logging.info(NAMESPACE, "User [" + user + "]" + "tried to join a a room but the room name was not provided.");
        return res.status(status.ROOM_NAME_NOT_PROVIDED).json({
            title : UNAUTHORIZED,
            message : "Room name has not been provided."
        }  as IResponse);
    }
    
    else if(!user) {
        logging.info(NAMESPACE, "A user tried to join the room [" + roomName +"]" + " but the username wasn't provided.");
        return res.status(status.USERNAME_NOT_PROVIDED).json({
            title : UNAUTHORIZED,
            message : "User name has not been provided."
        } as IResponse);
    } 
    
    else if(!socketID){
        logging.info(NAMESPACE, "User [" + user + "]" + "tried to join room [" + roomName + "], but he wasn't connected to socket.");

        return res.status(status.USER_NOT_LOGGED_IN).json({
            title : UNAUTHORIZED,
            message : "User not loggedin"
        } as IResponse);
    }

}

/** creating new user & storing in DB */
const getRoomData = (req: Request, res: Response, next: NextFunction) => {
    const params = req.body;

    let roomName = params.room;
    let user = params.user;
    let rooms = ChatService.getRooms();

    if(user && roomName && rooms.has(roomName)) {

        let room = rooms.get(roomName);

        if(room?.hasUser(user) || roomName == "General") {
            logging.info(NAMESPACE, "User [" + user + "]" + " requested data from the room [" + roomName + "], it has been provided.");
            res.status(200).json({
                title : AUTHORIZED,
                message : "Room data provided.",
                /** IRoom */
                room : {
                    name : room?.getName(),
                    owner : room?.getOwner(),
                    password: room?.getPassword(),
                    history: room?.getHistory(),
                    users: ChatService.getRooms().get(roomName)?.getUsers(),
                    connectedUsers: room?.getConnectedUsers()
                } as IRoom
            });
        }
        
        else {
            res.status(status.USER_NOT_IN_ROOM).json({
                title : UNAUTHORIZED,
                message : "User not in room",
            } as IResponse);
        }
    }
    
    else if(!rooms.has(roomName) && roomName) {
        logging.info(NAMESPACE, "User [" + user + "]" + "requested data from [" + roomName + "], but it wasn't found.");
        return res.status(status.ROOM_DOESNT_EXIST).json({
            title : UNAUTHORIZED,
            message : "Room doesn't exist"
        } as IResponse);
    }
    
    else if(!roomName) {
        logging.info(NAMESPACE, "User [" + user + "]" + "requested data a room but the room name was not provided.");
        return res.status(status.ROOM_NAME_NOT_PROVIDED).json({
            title : UNAUTHORIZED,
            message : "Room name has not been provided."
        } as IResponse);
    }
    
    else if(!user) {
        logging.info(NAMESPACE, "A user tried to request data from the room [" + roomName +"]" + " but the username wasn't provided.");
        return res.status(status.USERNAME_NOT_PROVIDED).json({
            title : UNAUTHORIZED,
            message : "User name has not been provided."
        } as IResponse);
    }
}


/** creating new user & storing in DB */
const leaveRoom = (req: Request, res: Response, next: NextFunction) => {
    const params = req.body;

    let roomName = params.room;
    let user = params.user;

    let rooms = ChatService.getRooms();

    let socketID = userService.getSocketIDFromUser(user);

    if(user && roomName && rooms.has(roomName) && socketID) {

        let room = rooms.get(roomName)
        let socket = socketService.getServer().sockets.sockets.get(socketID);
        if(room?.hasUser(user)) {

            DatabaseService.removeUserFromRoom(roomName, user)
            .then(() => {
                logging.info(NAMESPACE, "User [" + user + "] successfully removed from Room [" + roomName + "].");

                room?.disconnectUser(user);
                room?.deleteUser(user);
                // Notify all user in the room that someone left
                // TODO: A verifier si c'est [user] ou user.
                socketService.getServer().in(roomName).emit('leave_room', { room : roomName, users: [user] });

                socket?.leave(roomName);

                res.status(status.AUTHORIZED).json({
                    title : AUTHORIZED,
                    message : "User left successfully.",
                } as IResponse);
            })
            .catch((error) => {
                logging.error(NAMESPACE, "database error " + error);
                return res.status(status.DATABASE_ERROR).json({
                    title : UNAUTHORIZED,
                    message : error
                });
            })

        } else {
            logging.info(NAMESPACE, "User [ " + user + "]" + "tried to leave room [" + roomName + "], but he wasn't found in that room.");
            res.status(status.USER_NOT_IN_ROOM).json({
                title : UNAUTHORIZED,
                message : "User not in room.",
            } as IResponse);
        }
        
    }
    
    else if(!rooms.has(roomName) && roomName) {
        logging.info(NAMESPACE, "User [" + user + "]" + "tried to leave [" + roomName + "], but it wasn't found.");

        return res.status(status.ROOM_DOESNT_EXIST).json({
            title : UNAUTHORIZED,
            message : "Room doesn't exist."
        } as IResponse);
    }
    
    else if(!roomName) {
        logging.info(NAMESPACE, "User [" + user + "]" + "tried to leave a room, but the room name was not provided.");

        return res.status(status.ROOM_NAME_NOT_PROVIDED).json({
            title : UNAUTHORIZED,
            message : "Room name has not been provided."
        } as IResponse);
    }
    
    else if(!user) {
        logging.info(NAMESPACE, "A user tried to leave the room [" + roomName +"]" + " but the username wasn't provided.");
        return res.status(status.USERNAME_NOT_PROVIDED).json({
            title : UNAUTHORIZED,
            message : "User name has not been provided."
        } as IResponse);
    }

    else if(!socketID){
        logging.info(NAMESPACE, "User [" + user + "]" + "tried to leave room [" + roomName + "], but he wasn't connected to socket.");
        return res.status(status.USER_NOT_LOGGED_IN).json({
            title : UNAUTHORIZED,
            message : "User not loggedin"
        } as IResponse);
    }

}


/** update last deconnection date */
const GetAllRooms = (req: Request, res: Response, next: NextFunction) => {
    let ans: Array<IRoom>  = [];
    ChatService.getRooms().forEach( (room : Room) => {
        if (!room.getName().startsWith("TEAM_")) {
            ans.push({
                name: room.getName(),
                owner: room.getOwner(),
                password: room.getPassword(),
                history: room.getHistory(),
                users: room.getUsers(),
                connectedUsers: room.getConnectedUsers()
            })
        }
    });
    res.status(status.AUTHORIZED).json({ rooms: ans });
}

/** update last deconnection date */
const getJoinedRooms = (req: Request, res: Response, next: NextFunction) => {
    const params = req.body
    if(params.user) {
        let user = params.user
        let ans: Array<IRoom>  = [];
        ChatService.getRooms().forEach((room : Room) => {
            if (room.hasUser(user)) {
                ans.push({
                    name: room.getName(),
                    history: room.getHistory(),
                    users: room.getUsers(),
                    owner: room.getOwner(),
                    password: room.getPassword(),
                    connectedUsers: room.getConnectedUsers()
                } as IRoom)
            }
        });
        return res.status(status.AUTHORIZED).json({
            rooms: ans
        });
    }

    else {
        return res.status(status.USERNAME_NOT_PROVIDED).json({
            title: UNAUTHORIZED,
            message: "User name has not been provided."
        });
    }
}

const getUnjoinedRooms = (req: Request, res: Response, next: NextFunction) => {
    const params = req.body
    if(params.user) {
        let user = params.user
        let ans: Array<IRoom>  = [];
        ChatService.getRooms().forEach((room : Room) => {
            if (!room.hasUser(user) && !room.getName().startsWith("TEAM_")) {
                ans.push({
                    name: room.getName(),
                    history: room.getHistory(),
                    users: room.getUsers(),
                    owner: room.getOwner(),
                    password: room.getPassword(),
                    connectedUsers: room.getConnectedUsers()
                } as IRoom)
            }
        });
        return res.status(status.AUTHORIZED).json({
            rooms: ans
        });
    }

    else {
        return res.status(status.USERNAME_NOT_PROVIDED).json({
            title: UNAUTHORIZED,
            message: "User name has not been provided."
        });
    }
}

const create_room = async (req: Request, res: Response, next: NextFunction) => {

    const params = req.body;

    let roomName = params.room;
    let user = params.user;
    let password = params.password;

    let rooms = ChatService.getRooms();

    let socketID = userService.getSocketIDFromUser(user);

    /** Gerer dans le client le fait de laisser seulement des nom de room valide (plus que 3 caracteres) */
    if(user && roomName && socketID && !rooms.has(roomName)) {

        await DatabaseService.createRoom(roomName, user, password)
        .then(() => {
            let room =  new Room(roomName, user, new Array<IMessage>(), new Array<string>(), password);
            rooms.set(roomName, room);

            /** if private room, ne pas emit, else, emit que elle a ete creer */
            logging.info(NAMESPACE, "Room successfully created: [" + roomName  +"], Owner: [" + room.getOwner() + "]");

            // pour la add chez tout les clients
            socketService.getServer().emit("create_room", { room: roomName });

            // ajouter le créateur dans la room créée
            let socket = socketService.getServer().sockets.sockets.get(socketID as string);
            socket?.join(roomName);
            room?.AddUser(user);
            room?.connectUser(user);
            
            logging.info(NAMESPACE, "User [" + user +"] successfully joined the room [" + roomName + "].");
            
            // nécessaire? Oui
            socketService.getServer().to(roomName).emit('join_room', { room : roomName, user : user });

            res.status(status.AUTHORIZED).json({
                title : AUTHORIZED,
                message : "Room created successfully."
            });
        })
        .catch((error) => {
            logging.error(NAMESPACE, "database error " + error);
            return res.status(status.DATABASE_ERROR).json({
                title : UNAUTHORIZED,
                message : error
            });
        })
            
    }
        
    else if(rooms.has(roomName)) {
        /** if private, saying a private room with that name exists */
        logging.info(NAMESPACE, "User [" + user + "]" + "tried to create room [" + roomName + "], but a room with that name already exists.");
        return res.status(status.ROOM_ALREADY_EXISTS).json({
            title : UNAUTHORIZED,
            message : "Room with that name already exists."
        });
    }
        
    else if(!roomName) {
        logging.info(NAMESPACE, "User [" + user + "]" + "tried to create a room, but the room name was not provided.");
        return res.status(status.ROOM_NAME_NOT_PROVIDED).json({
            title : UNAUTHORIZED,
            message : "Room name has not been provided."
        });
    }
        
    else if(!user) {
        logging.info(NAMESPACE, "A user tried to create the room [" + roomName +"]" + " but the username wasn't provided.");
        return res.status(status.USERNAME_NOT_PROVIDED).json({
            title : UNAUTHORIZED,
            message : "User name has not been provided."
        });
    }

    else if (!socketID) {
        logging.info(NAMESPACE, "User [" + user + "] tried to create the room [" + roomName + "], but he wasn't connected.")
        return res.status(status.USER_NOT_LOGGED_IN).json({
            title : UNAUTHORIZED,
            message : "User not connected."
        });
    }
}


/** creating new user & storing in DB */
const delete_room = (req: Request, res: Response, next: NextFunction) => {
    const params = req.body;

    let roomName = params.room;
    let user = params.user;

    let rooms = ChatService.getRooms();

    let socketID = userService.getSocketIDFromUser(user);

    if(user && roomName && rooms.has(roomName)) {
        let room = rooms.get(roomName);

        if(room?.getOwner() === user) {

            logging.info(NAMESPACE, "Deleting the room [" + roomName + "]");

            DatabaseService.deleteRoom(roomName)
            .then(() => {

                logging.info(NAMESPACE, "Successfully deleted the room [" + roomName + "] from database.")

                let users = rooms.get(roomName)?.getUsers() as Array<string>;

                users.forEach(user => {
                    logging.info(NAMESPACE, "Removing user [" + user +"] from room [" + roomName + "]");
                    socketService.getServer().sockets.sockets.get(socketID as string)?.leave(roomName);
                });

                rooms.delete(roomName);
                /** if private room, emit juste a ceux quisont dans la room else, emit a tout les users */
                socketService.getServer().emit("delete_room", { room : roomName });
                logging.info(NAMESPACE, "User [" + user + "] succesfully deleted room [" + roomName +"].");
                return res.status(status.AUTHORIZED).json({
                    title : AUTHORIZED,
                    message : "Room deleted.",
                });
            })
            .catch((error) => {
                logging.error(NAMESPACE, "database error " + error);
                return res.status(status.DATABASE_ERROR).json({
                    title : UNAUTHORIZED,
                    message : error
                });
            })
        }

        else {
            logging.info(NAMESPACE, "User [" + user + "] tried to delete room [" + roomName +"], but he wasn't the owner.");
            return res.status(status.ONLY_OWNER_CAN_DELETE).json({
                title : UNAUTHORIZED,
                message : "Only the owner of a room can delete it !",
            });
        }
    }
    
    else if(!rooms.has(roomName) && roomName) {
        logging.info(NAMESPACE, "User [" + user + "] tried to delete room [" + roomName +"], but it wasn't found.");
        return res.status(status.ROOM_DOESNT_EXIST).json({
            title : UNAUTHORIZED,
            message : "Room doesn't exist.",
        });
    }
    
    else if(!roomName) {
        logging.info(NAMESPACE, "User [" + user + "] tried to delete a room, but the room name wasn't provided.");
        return res.status(status.ROOM_NAME_NOT_PROVIDED).json({
            title : UNAUTHORIZED,
            message : "Room name has not been provided.",
        });
    }
    
    else if(!user) {
        logging.info(NAMESPACE, "A user tried to delete room [" + roomName +"], but the username wasn't provided");
        return res.status(status.USERNAME_NOT_PROVIDED).json({
            title : UNAUTHORIZED,
            message : "Owner name has not been provided.",
        });
    }

    else if(!socketID){
        logging.info(NAMESPACE, "User [" + user + "] tried to delete room [" + roomName +"], but he wasn't logged in.");
        return res.status(status.USER_NOT_LOGGED_IN).json({
            title : UNAUTHORIZED,
            message : "User not loggedin."
        });
    }

}

export default {
    join_room,
    getRoomData,
    leaveRoom,
    GetAllRooms,
    delete_room,
    create_room,
    getJoinedRooms,
    getUnjoinedRooms
}
