import { NextFunction, Request, Response } from 'express';
import logging from '../config/logging';
import signJWT from '../functions/signJWT';
import { IUser } from '../interfaces/user';
import userService, { action } from '../services/UserService';
import DatabaseService from '../services/databaseService';
import * as Httpstatus from '../utils/HTTP-Codes';
import { uploadFile } from '../functions/firebase';
import ChatService from '../services/chatService';
import { IAction } from '../interfaces/IAction';
import { User } from '../classes/user';
import teamService from '../services/TeamService';
import drawingService from '../services/drawingService';
import { Room } from '../classes/room';
import socketService from '../services/socketService';
import commandControllerService from '../services/commandControllerService';
import { AbstractCommand } from '../classes/commands/abstractCommand';

const NAMESPACE = "User";

/** protected route for testing (to make sure the token we assing is working properly) */
const validateToken = (req: Request, res: Response, next: NextFunction) => {
    logging.info(NAMESPACE, "Token validated");

    return res.status(Httpstatus.AUTHORIZED).json({
        message: "authorized"
    });
}


/** creating new user & storing in DB */
const register = async (req: Request, res: Response, next: NextFunction) => {
/*
    { 
        email           :   string,
        password        :   string,
        firstname       :   string,
        lastname        :   string,
        username        :   string,
        avatar          :   byte[] | ,
    }
*/
    let raw_user_data: IUser = req.body;
    if(raw_user_data.email &&
        raw_user_data.password &&
        raw_user_data.firstname &&
        raw_user_data.lastname &&
        raw_user_data.username &&
        raw_user_data.avatar)
        {
            // TODO: Changer 
            let error = false;
            await DatabaseService.countEmail(raw_user_data.email).then((data) => {
                if(data > 0) {
                    error = true;
                    return res.status(Httpstatus.EMAIL_ALREADY_EXISTS).json({
                        title: "Unauthorized",
                        message : "email already exists",
                    });
                }
            })
            .catch(async (err) => {})

            if(error) return;

            await DatabaseService.countUsername(raw_user_data.username).then(data => {
                if(data > 0) {
                    error = true;
                    return res.status(Httpstatus.USERNAME_ALREADY_EXISTS).json({
                        title: "Unauthorized",
                        message : "Username already exists",
                    });
                }
            }).catch(err =>{})

            if(error) return;

            let link = raw_user_data.avatar;
            error = false;
            if(Array.isArray(link)) {
                let buffer = Buffer.from(raw_user_data.avatar)
                await uploadFile(raw_user_data.username, buffer)
                .then(async (res) => { link = res as string })
                .catch((err) => {
                    error = true;
                    return res.status(Httpstatus.DATABASE_ERROR).json({
                        title: "Unauthorized",
                        message: "Failed to save upload avatar",
                        error: err
                    })
                })
            }

            if(error) return;

            const timestamp = Date.now()

            let newTimestampArr: Array<number> = []
            newTimestampArr.push(timestamp)

            await DatabaseService.registerUser(
                raw_user_data.email,
                raw_user_data.password,
                raw_user_data.firstname,
                raw_user_data.lastname,
                raw_user_data.username,
                link as string,
                timestamp, // Default to Date.now
                timestamp // Default to Date.now
            )
            .then((message) => {
                logging.info(NAMESPACE, "User [" + raw_user_data.username +"] successfully registered.");
                
                userService.getUsers().set(
                    raw_user_data.username, userService.createUserFromIUser(
                        {
                            email               :   raw_user_data.email,
                            password            :   raw_user_data.password,
                            firstname           :   raw_user_data.firstname,
                            lastname            :   raw_user_data.lastname,
                            username            :   raw_user_data.username,
                            avatar              :   link,
                            lastConnection      :   newTimestampArr,
                            LastDeconnection    :   newTimestampArr,
                            historiqueEdition   :   new Array<string>(),
                            collaborations      :   new Array<string>(),
                            ownership           :   new Array<string>(),
                            teams               :   new Array<string>(),
                            totalTimeCollab     :   0,
                            isNamePublic        :   true,
                            isEmailPublic       :   true,
                            lastAction          :   new Array<IAction>()
                        } as IUser)
                );
                userService.disconnectUser(raw_user_data.username)
                DatabaseService.addUserToRoom("General", raw_user_data.username).then(() => {
                    ChatService.getRooms().get("General")?.AddUser(raw_user_data.username);
                }).catch((error) => {
                    logging.error(NAMESPACE, "database error : " + error);
                });

                return res.status(Httpstatus.AUTHORIZED).json({
                    title: "Authorized",
                    message : "User successfully registered.",
                });
            })
            .catch((error) => {
                logging.info(NAMESPACE, "Failed to save user [" + raw_user_data.username +"]. Error:", error)
                return res.status(Httpstatus.DATABASE_ERROR).json({
                    title: "Unauthorized",
                    message: "Failed to save user to database.",
                    error: error.message
                })
            })

        } else if (!raw_user_data.email) {
            return res.status(Httpstatus.EMAIL_NOT_PROVIDED).json({
                title: "Unauthorized",
                message : "No email provided.",
            });
        } else if (!raw_user_data.password) {
            return res.status(Httpstatus.PASSWORD_NOT_PROVIDED).json({
                title: "Unauthorized",
                message : "No password provided.",
            });
        } else if (!raw_user_data.firstname) {
            return res.status(Httpstatus.FIRSTNAME_NOT_PROVIDED).json({
                title: "Unauthorized",
                message : "No firstname provided.",
            });
        } else if (!raw_user_data.lastname) {
            return res.status(Httpstatus.LASTNAME_NOT_PROVIDED).json({
                title: "Unauthorized",
                message : "No lastname provided.",
            });
        } else if (!raw_user_data.avatar) {
            return res.status(Httpstatus.LASTNAME_NOT_PROVIDED).json({
                title: "Unauthorized",
                message : "No avatar provided.",
            });
        }
}

/** login the user and returns the token */
const login = async (req: Request, res: Response, next: NextFunction) => {

    let { email, password } = req.body;

    const filter = { email: email }

    const timestamp = Date.now()

    if (email && password) {
        await DatabaseService.findUserByEmail(email)
        .then(async (data: IUser) => {
            // TODO: hash password
            if (data?.password == password) {

                logging.info(NAMESPACE, "password ok for user " + email);
                
                // TODO: USERNAMES DOIVENT ETRE UNIQUE EN DATABASE, SINON CA PEUT PLANTER LA VERIFICATION EST PAS FAITE DANS REGISTER
                if (userService.IsUserConnected(data.username)) {
                    logging.info(NAMESPACE, "user " + data.username + " is already connected.");
                    return res.status(Httpstatus.USER_ALREADY_CONNECTED).json({
                        title : "Unauthorized",
                        message : "User is already connected."
                    });
                }

                signJWT (email, async (error, token) => {

                    if (error) { // signJWT
                        logging.error(NAMESPACE, "Unable to generate token ", error);
                        return res.status(Httpstatus.JWT_ERROR).json({
                            title : "Unauthorized",
                            message : error.message
                        });
                    }

                    else if (token) {
                        await DatabaseService.updateUserLastConnection(email, timestamp)
                        .then(async () => {
                            const newAction = {
                                action: action.LOGIN,
                                timestamp: timestamp,
                                drawing: null
                            }
                            await DatabaseService.updateUserLastAction(email, newAction)
                            .then(() => {
                                userService.connectUser(data.username);
                                userService.getUsers().get(data.username)?.setLastConnection(timestamp)
                                userService.getUsers().get(data.username)?.addLastAction(newAction)
                                return res.status(Httpstatus.AUTHORIZED).json({
                                    title : "Authorized",
                                    token : token,
                                    username: data?.username,
                                    avatar: data?.avatar
                                });
                            })
                            .catch((error) => {
                                return res.status(Httpstatus.DATABASE_ERROR).json({
                                    title : "Unauthorized",
                                    message : error.message
                                });
                            })
                        })
                        .catch((error) => {
                            return res.status(Httpstatus.DATABASE_ERROR).json({
                                title : "Unauthorized",
                                message : error.message
                            });
                        });
                    }
                })

            }
            
            else {
                return res.status(Httpstatus.WRONG_PASSWORD).json({
                    title : "Unauthorized",
                    message : "Wrong password."
                });
            }
        })
        .catch((error) => {
            return res.status(Httpstatus.EMAIL_NOT_FOUND).json({
                title : "Unauthorized",
                message : "No user with that email found."
            });
        })
    }
    
    else if (!email) {
        return res.status(Httpstatus.EMAIL_NOT_PROVIDED).json({
            title : "Unauthorized",
            error: "No email provided."
        });
    }
    
    else if(!password) {
        return res.status(Httpstatus.PASSWORD_NOT_PROVIDED).json({
            title : "Unauthorized",
            error: "No password provided."
        });
    }
}

/** update last deconnection date */
const logout = async (req: Request, res: Response, next: NextFunction) => {
    let filter = req.body;
    const timestamp = Date.now()
    /** TODO: ATTENTION AUX USERS AVEC LE MEME PSEUDONYME ! */
    if (filter.user && userService.IsUserConnected(filter.user)) {
        userService.disconnectUser(filter.user);
        // TODO changer pour email
        let email = userService.getUsers().get(filter.user)?.getEmail() as string;
        DatabaseService.updateUserLastDeconnection(email, timestamp)
        .then(() => {
            const newAction = {
                action: action.LOGOUT,
                timestamp: timestamp,
                drawing: null
            }
            DatabaseService.updateUserLastAction(email, newAction)
            .then(() => {
                userService.getUsers().get(filter.user)?.setLastDeconnection(Date.now())
                userService.getUsers().get(filter.user)?.addLastAction(newAction)
                return res.status(Httpstatus.AUTHORIZED).json({
                    title : "Authorized",
                    message: "Successfully logged out."
                });
            })
        }).catch(() => {
            return res.status(Httpstatus.DATABASE_ERROR).json({
                title: "Unauthorized",
                message: "Failed to save user to database.",
            })
        })

    } else if (!userService.IsUserConnected(filter.user)) {
        return res.status(Httpstatus.USER_NOT_CONNECTED).json({
            title : "Unauthorized",
            message : "The user is not connected."
        });
    } else if (!filter.user) {
        return res.status(Httpstatus.USERNAME_NOT_PROVIDED).json({
            title : "Unauthorized",
            error: "No username provided"
        });
    }
}

const get_user_data = async (req: Request, res: Response, next: NextFunction) => {
    const param = req.body;

    const user = userService.getUsers().get(param.user)

    if (user) {
        return res.status(Httpstatus.AUTHORIZED).json({
            user: {
                email: user.getEmail(),
                password: user.getPassword(),
                firstname: user.getFirstname(),
                lastname: user.getLastname(),
                username: user.getUsername(),
                avatar: user.getAvatar(),
                average_collab_time: user.getHistoriqueEdition().length > 0 ? (user.getTotalTimeCollab() / user.getHistoriqueEdition().length) : 0,
                nb_collaborations: user.getCollaborations().length,
                nb_ownership: user.getOwnership().length,
                nb_teams: user.getTeams().length,
                totalTimeCollab: user.getTotalTimeCollab(),
                isNamePublic: user.getIsNamePublic(),
                isEmailPublic: user.getIsEmailPublic(),
                lastAction: user.getLastAction()
                // A voir si on décide d'envoyer une liste d'action ou une liste de dession qu'il a join
                // historiqueEdition: user.getHistoriqueEdition()
                // LastConnection: user.getLastConnection(),
                // LastDeconnection: user.getLastDeconnection(),
            }
        });
    }
    else {
        return res.status(404).json({
            title: "Unauthorized",
            message: "User does not exist."
        });
    }
}

// TODO
const update_username = async (req: Request, res: Response, next: NextFunction) => {
    let param = req.body;
    let user = userService.getUsers().get(param.user);

    if (userService.getUsers().get(param.newUser)) {
        return res.status(Httpstatus.USERNAME_ALREADY_EXISTS).json({
            title: "Unauthorized",
            message: "New username already exists"
        });
    }

    if (param.user && param.newUser) {
        // check if user exists
        if (user) {
            DatabaseService.updateUserInfo(user.getEmail(), {
                username: param.newUser
            })
            .then(() => {
                // set userData
                userService.getUsers().delete(param.user);
                userService.getUsers().set(param.newUser, user as User);
                user?.setUsername(param.newUser);
                // set user_socketID
                // set socketID_user
                const userSocketId = userService.getSocketIDFromUser(param.user);
                userService.deleteSocket(userSocketId as string, param.user);
                userService.SetSocket(userSocketId as string, param.newUser);
                // set userStatus
                const userStatus = userService.getUserStatus().get(param.user);
                userService.getUserStatus().delete(param.user);
                userService.setUserStatus(param.newUser, userStatus as string);
                // update every user's teams
                user?.getTeams().forEach((team: string) => {
                    teamService.getTeams().get(team)?.deleteUser(param.user);
                    teamService.getTeams().get(team)?.AddUser(param.newUser);
                    DatabaseService.removeUserFromTeam(team, param.user);
                    DatabaseService.addUserToTeam(team, param.newUser);
                })
                // update user's owned drawings
                user?.getOwnership().forEach((drawing: string) => {
                    drawingService.getDrawings().get(drawing)?.setOwner(param.newUser);
                    DatabaseService.updateDrawingOwner(drawing, param.newUser);
                })
                // update every user's chatroom
                ChatService.getRooms().forEach((room: Room) => {
                    if (room.hasUser(param.user)) {
                        DatabaseService.addUserToRoom(room.getName(), param.newUser)
                        .then(() => {
                            DatabaseService.removeUserFromRoom(room.getName(), param.user)
                            .then(() => {
                                // remove old username
                                room.disconnectUser(param.user);
                                room.deleteUser(param.user);
                                socketService.getServer().in(room.getName()).emit('leave_room', { room : room.getName(), users: [user] });
                                // add new username
                                room.connectUser(param.newUser);
                                room.AddUser(param.newUser);
                                socketService.getServer().to(room.getName()).emit('join_room', { room : room.getName(), user : param.newUser });
                            })
                            .catch((error) => {
                                return res.status(Httpstatus.DATABASE_ERROR).json({
                                    title: "Unauthorized",
                                    message: "Failed to remove old user from room " + room.getName()
                                });
                            })
                        })
                        .catch((error) => {
                            return res.status(Httpstatus.DATABASE_ERROR).json({
                                title: "Unauthorized",
                                message: "Failed to add new user to room " + room.getName()
                            });
                        })
                        
                    }
                })
                // update user's command stack
                const commandDoneStack = commandControllerService.commandsDone.get(param.user);
                const commandUndoneStack = commandControllerService.commandsUndone.get(param.user);
                commandControllerService.removeUser(param.user);
                commandControllerService.commandsDone.set(param.newUser, commandDoneStack as AbstractCommand[]);
                commandControllerService.commandsUndone.set(param.newUser, commandUndoneStack as AbstractCommand[]);

                // update selectedObject list
                let object = drawingService.getSelectedObjects().get(param.user);

                if (object) {
                    drawingService.getSelectedObjects().delete(param.user);
                    drawingService.getSelectedObjects().set(param.newUser, object);
                }

                return res.status(Httpstatus.AUTHORIZED).json({
                    title: "Authorized",
                    message: "Sucessfully updated user's username"
                });
            })
            .catch((error => {
                return res.status(Httpstatus.DATABASE_ERROR).json({
                    title: "Unauthorized",
                    message: "Failed to change user's username"
                });
            }))
        }
    } else {
        return res.status(404).json({
            title: "Unauthorized",
            message: "Bad request"
        });
    }
}

const update_avatar = async (req: Request, res: Response, next: NextFunction) => {
    let param = req.body;
    let user = userService.getUsers().get(param.user);

    if (param.user && param.avatar) {
        // check if user exists
        if (user) {
            let link = param.avatar;
            let error = false;
            if(Array.isArray(link)) {
                let buffer = Buffer.from(param.avatar)
                await uploadFile(param.user, buffer)
                .then(async (res) => { link = res as string })
                .catch((err) => {
                    error = true;
                    return res.status(Httpstatus.DATABASE_ERROR).json({
                        title: "Unauthorized",
                        message: "Failed to upload avatar",
                        error: err
                    })
                })
            }

            if(error) return;

            DatabaseService.updateUserInfo(user.getEmail(), {
                avatar: link
            })
            .then(() => {
                user?.setAvatar(link);
                return res.status(Httpstatus.AUTHORIZED).json({
                    title: "Authorized",
                    message: "Sucessfully updated user's avatar"
                });
            })
            .catch((error => {
                return res.status(Httpstatus.DATABASE_ERROR).json({
                    title: "Unauthorized",
                    message: "Failed to update user's avatar"
                });
            }))
        }
    } else {
        return res.status(404).json({
            title: "Unauthorized",
            message: "Bad request"
        });
    }
}

const update_password = async (req: Request, res: Response, next: NextFunction) => {
    let param = req.body;
    let user = userService.getUsers().get(param.user);

    if (param.user && param.password) {
        // check if user exists
        if (user) {
            DatabaseService.updateUserInfo(user.getEmail(), {
                password: param.password
            })
            .then(() => {
                user?.setPassword(param.password);
                return res.status(Httpstatus.AUTHORIZED).json({
                    title: "Authorized",
                    message: "Sucessfully updated user's password"
                });
            })
            .catch((error => {
                return res.status(Httpstatus.DATABASE_ERROR).json({
                    title: "Unauthorized",
                    message: "Failed to change user's avatar"
                });
            }))
        }
    } else {
        return res.status(404).json({
            title: "Unauthorized",
            message: "Bad request"
        });
    }
}

const update_fullname_privacy = async (req: Request, res: Response, next: NextFunction) => {
    let param = req.body;
    let user = userService.getUsers().get(param.user);

    if (param.user && param.isNamePublic != null) {
        // check if user exists
        if (user) {
            DatabaseService.updateUserInfo(user.getEmail(), {
                isNamePublic: param.isNamePublic
            })
            .then(() => {
                user?.setIsNamePublic(param.isNamePublic);
                return res.status(Httpstatus.AUTHORIZED).json({
                    title: "Authorized",
                    message: "Sucessfully updated user's fullname privacy"
                });
            })
            .catch((error => {
                return res.status(Httpstatus.DATABASE_ERROR).json({
                    title: "Unauthorized",
                    message: "Failed to updated user's fullname privacy"
                });
            }))
        }
    } else {
        return res.status(404).json({
            title: "Unauthorized",
            message: "Bad request"
        });
    }
}

const update_email_privacy = async (req: Request, res: Response, next: NextFunction) => {
    let param = req.body;
    let user = userService.getUsers().get(param.user);

    if (param.user && param.isEmailPublic != null) {
        // check if user exists
        if (user) {
            DatabaseService.updateUserInfo(user.getEmail(), {
                isEmailPublic: param.isEmailPublic
            })
            .then(() => {
                user?.setIsEmailPublic(param.isEmailPublic);
                return res.status(Httpstatus.AUTHORIZED).json({
                    title: "Authorized",
                    message: "Sucessfully updated user's email privacy"
                });
            })
            .catch((error => {
                return res.status(Httpstatus.DATABASE_ERROR).json({
                    title: "Unauthorized",
                    message: "Failed to updated user's email privacy"
                });
            }))
        }
    } else {
        return res.status(404).json({
            title: "Unauthorized",
            message: "Bad request"
        });
    }
}

export default {
    validateToken,
    register,
    login,
    logout,
    get_user_data,
    update_username,
    update_avatar,
    update_password,
    update_fullname_privacy,
    update_email_privacy
}
