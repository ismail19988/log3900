import { NextFunction, Response, Request } from "express";
import { Room } from "../classes/room";
import { Team } from "../classes/team";
import logging from "../config/logging";
import { IMessage } from "../interfaces/IMessage";
import { ITeam } from "../interfaces/team";
import ChatService from "../services/chatService";
import DatabaseService from "../services/databaseService";
import drawingService from "../services/drawingService";
import socketService from "../services/socketService";
import teamService from "../services/TeamService";
import userService from "../services/UserService";
import * as HTTP_status from '../utils/HTTP-Codes';

const NAMESPACE = "Drawing queries";
const TEAM_CHATROOM_PREFIX = "ROOM_TEAM_";


const create_team = async (req: Request, res: Response, next: NextFunction) => {
    let team: ITeam = req.body;
    // TODO checkings => team avec le meme nom
    if(team.name && team.owner && team.users && team.maxUsers && team.bio) {
        if(teamService.getTeams().has(team.name)) {

            return res.status(404).json({
                title: "Unauthorized",
                message : "Team with that name already exists",
            });
        }

        await DatabaseService.createTeam(team.name, team.owner, team.password ? team.password : "", team.users, team.maxUsers, team.bio).then(async () => {
            teamService.addTeam(team)

            // create associated chatroom for the new team

            const roomName = TEAM_CHATROOM_PREFIX + team.name;

            let error = false;

            await DatabaseService.createRoom(roomName, team.owner, team.password)
            .then(() => {
                let room =  new Room(roomName, team.owner, new Array<IMessage>(), new Array<string>(), team.password);
                ChatService.getRooms().set(roomName, room);

                /** if private room, ne pas emit, else, emit que elle a ete creer */
                logging.info(NAMESPACE, "Room successfully created: [" + roomName  +"], Owner: [" + room.getOwner() + "]");

                // pour la add chez tout les clients
                socketService.getServer().emit("create_room", { room: roomName });

                let socketID = userService.getSocketIDFromUser(team.owner);

                // ajouter le créateur dans la room créée
                let socket = socketService.getServer().sockets.sockets.get(socketID as string);
                socket?.join(roomName);
                room?.AddUser(team.owner);
                room?.connectUser(team.owner);
                
                logging.info(NAMESPACE, "User [" + team.owner +"] successfully joined the room [" + roomName + "].");
                
                // nécessaire? Oui
                socketService.getServer().to(roomName).emit('join_room', { room : roomName, user : team.owner });
            })
            .catch ((err) => {
                error = true;
                return res.status(HTTP_status.DATABASE_ERROR).json({
                    title : "Unauthorized",
                    message : err.message
                });
            })

            if (error) {
                return;
            }

            return res.status(200).json({
                title: "Authorized",
                message : "Team created",
            });

        }).catch((err) => {
            return res.status(HTTP_status.DATABASE_ERROR).json({
                title : "Unauthorized",
                message : err.message
            });
        })
    } else if(!team.name) {
        return res.status(404).json({
            title : "Unauthorized",
            message : "Team name not provided"
        });
    } else if(!team.owner) {
        return res.status(404).json({
            title : "Unauthorized",
            message : "Owner name not provided"
        });
    } else if(!team.bio) {
        return res.status(404).json({
            title : "Unauthorized",
            message : "Bio not provided"
        });
    } else if(!team.maxUsers) {
        return res.status(404).json({
            title : "Unauthorized",
            message : "Max users not provided"
        });
    } else if(!team.users) {
        return res.status(404).json({
            title : "Unauthorized",
            message : "Users not provided"
        });
    }

}

const join_team = async (req: Request, res: Response) => {
    let team: string = req.body.name;
    let user: string = req.body.user;
    // TODO check if team exists

    let teams = teamService.getTeams();

    let socketID = userService.getSocketIDFromUser(user);
    
    if(team && user) {
        if(!teams.has(team)){
            return res.status(404).json({
                title: "Unauthorized",
                message : "Team doesn't exist",
            });
        }

        if(teams.get(team)?.hasUser(user)){
            return res.status(HTTP_status.DATABASE_ERROR).json({
                title : "Unauthorized",
                message : "User already in team"
            });
        }

        if ((teams.get(team)?.getMaxUsers() as number) <= (teams.get(team)?.getUsers().length as number)) {
            return res.status(HTTP_status.TEAM_MAX_USERS_LIMIT_REACHED).json({
                title : "Unauthorized",
                message : "Max users limit reached."
            });
        }

        if ((teams.get(team)?.getMaxUsers() as number) <= (teams.get(team)?.getUsers().length as number)) {
            return res.status(HTTP_status.TEAM_MAX_USERS_LIMIT_REACHED).json({
                title: "Unauthorized",
                message: "Team has reached its maximum member limit"
            });
        }
    
        await DatabaseService.addUserToTeam(team, user).then(async () => {
            teams.get(team)?.AddUser(user);
            let userStatus =  userService.getUserStatus().get(user);
            socketService.getServer().emit('join_team', { user: user, status: userStatus, team: team });

            // add user in team chatroom
            const roomName = TEAM_CHATROOM_PREFIX + team;

            let error = false;


            await DatabaseService.addUserToRoom(roomName, user)
            .then(() => {

                socketService.getServer().sockets.sockets.get(socketID as string)?.join(roomName);

                let room = ChatService.getRooms().get(roomName);

                room?.AddUser(user);
                room?.connectUser(user);
                
                logging.info(NAMESPACE, "User [" + user +"] successfully joined the room [" + roomName + "].");

                socketService.getServer().to(roomName).emit('join_room', { room : roomName, user : user });

                userService.getUsers().get(user)?.addTeam(team);
                DatabaseService.updateUserTeams(userService.getUsers().get(user)?.getEmail() as string, team)
            })
            .catch((err) => {
                error = true;

                return res.status(HTTP_status.DATABASE_ERROR).json({
                    title : "Unauthorized",
                    message : err.message
                });
            })

            if (error) {
                return;
            }

            return res.status(200).json({
                title: "Authorized",
                message : "User Added to room",
            });

        }).catch((err) => {
            return res.status(HTTP_status.DATABASE_ERROR).json({
                title : "Unauthorized",
                message : err.message
            });
        })
    } else if(!team) {
        return res.status(404).json({
            title : "Unauthorized",
            message : "Team name not provided"
        });
    } else if(!user) {
        return res.status(404).json({
            title : "Unauthorized",
            message : "User name not provided"
        });
    }


}

const leave_team = async (req: Request, res: Response) => {
    
    let team: string = req.body.name;
    let user: string = req.body.user;

    if(team && user) {
        if(!teamService.getTeams().has(team)) {
            return res.status(404).json({
                title : "Unauthorized",
                message : "Team doesnt exist"
            });
        }

        if(!teamService.getTeams().get(team)?.hasUser(user)) {
            return res.status(404).json({
                title : "Unauthorized",
                message : "User not in the team specified"
            });
        }

        await DatabaseService.removeUserFromTeam(team, user).then((dbRes) => {
            teamService.getTeams().get(team)?.deleteUser(user);
            socketService.getServer().emit('leave_team', { user: user, team: team });

            // leave Team chatroom

            const roomName = TEAM_CHATROOM_PREFIX + team;

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

                let email = userService.getUsers().get(user)?.getEmail() as string;
                userService.getUsers().get(user)?.removeTeam(team);
                DatabaseService.removeUserTeams(email, team);
                // Notify all user in the room that someone left
                // TODO: A verifier si c'est [user] ou user.
                
            })
            .catch((err) => {
                error = true;

                return res.status(HTTP_status.DATABASE_ERROR).json({
                    title : "Unauthorized",
                    message : err.message
                });
            })

            if (error) {
                return;
            }

            return res.status(200).json({
                title: "Authorized",
                message : "User removed from room",
            });
        }).catch((err) => {
            return res.status(HTTP_status.DATABASE_ERROR).json({
                title : "Unauthorized",
                message : err.message
            });
        })

    } else if(!team) {
        return res.status(404).json({
            title : "Unauthorized",
            message : "Team name not provided"
        });
    } else if(!user) {
        return res.status(404).json({
            title : "Unauthorized",
            message : "User name not provided"
        });
    }
}

const delete_team = async (req: Request, res: Response) => {

    let teamName: string = req.body.name;

    if(teamName) {
        if(teamService.getTeams().has(teamName)) {
            await DatabaseService.deleteTeam(teamName).then((dbres) => {
                teamService.getTeams().get(teamName)?.getUsers().forEach(async (user) => {
                    let error = false;
                    await DatabaseService.removeUserFromTeam(teamName, user)
                    .then(() => {
                        let member = userService.getUsers().get(user)?.removeTeam(teamName);
                    })
                    .catch((err) => {
                        error = true;
                        return res.status(HTTP_status.DATABASE_ERROR).json({
                            title : "Unauthorized",
                            message : err.message
                        });
                    })
                    if (error) return;
                })
                teamService.deleteTeam(teamName);

                // delete team associated drawing

                const SOCKET_DRAWING_CHATROOM_PREFIX = 'ROOM_DRAWING_';

                drawingService.getDrawings().forEach(drawing => {
                    if (drawing.getTeam() == teamName) {
                        DatabaseService.deleteDrawing(drawing.getName())
                        .then(() => {
                            drawingService.getDrawings().delete(drawing.getName());

                            const SOCKET_ROOM_PREFIX = 'DRAWING_';
                            socketService.getServer().emit("new_drawing");
                        })

                        let roomName = SOCKET_DRAWING_CHATROOM_PREFIX + drawing.getName();

                        DatabaseService.deleteRoom(roomName)
                        .then(() => {
                            let rooms = ChatService.getRooms();

                            logging.info(NAMESPACE, "Successfully deleted the room [" + roomName + "] from database.")

                            let users = rooms.get(roomName)?.getUsers() as Array<string>;

                            users.forEach(user => {
                                logging.info(NAMESPACE, "Removing user [" + user +"] from room [" + roomName + "]");
                                socketService.getServer().sockets.sockets.get(userService.getSocketIDFromUser(user) as string)?.leave(roomName);
                            });

                            rooms.delete(roomName);
                            /** if private room, emit juste a ceux quisont dans la room else, emit a tout les users */
                            socketService.getServer().emit("delete_room", { room : roomName });
                            logging.info(NAMESPACE, "Succesfully deleted room [" + roomName +"].");
                        })
                    }
                })

                const roomName = TEAM_CHATROOM_PREFIX + teamName;

                // delete team associated chatroom

                let error = false;

                DatabaseService.deleteRoom(roomName)
                .then(() => {

                    let rooms = ChatService.getRooms();

                    logging.info(NAMESPACE, "Successfully deleted the room [" + roomName + "] from database.")

                    let users = rooms.get(roomName)?.getUsers() as Array<string>;

                    users.forEach(user => {
                        logging.info(NAMESPACE, "Removing user [" + user +"] from room [" + roomName + "]");
                        socketService.getServer().sockets.sockets.get(userService.getSocketIDFromUser(user) as string)?.leave(roomName);
                    });

                    rooms.delete(roomName);
                    /** if private room, emit juste a ceux quisont dans la room else, emit a tout les users */
                    socketService.getServer().emit("delete_room", { room : roomName });
                    logging.info(NAMESPACE, "Succesfully deleted room [" + roomName +"].");
                })
                .catch((err) => {
                    error = true;

                    return res.status(HTTP_status.DATABASE_ERROR).json({
                        title : "Unauthorized",
                        message : err.message
                    });
                })

                return res.status(200).json({
                    title: "Authorized",
                    message : "Team successfully deleted",
                });
            }).catch((err) => {
                return res.status(HTTP_status.DATABASE_ERROR).json({
                    title : "Unauthorized",
                    message : err.message
                });
            })
        }
        else {
            return res.status(404).json({
                title : "Unauthorized",
                message : "Team doesnt exist"
            });
        }
    } else {
        return res.status(404).json({
            title : "Unauthorized",
            message : "Team name not provided"
        });
    }
}

const get_all_teams = async (req: Request, res: Response) => {
    let ans: Array<Object>  = [];
    teamService.getTeams().forEach((team: Team) => {
        let userStatus: Array<Object> = [];

        team.getUsers().forEach((user: string) => {
            const status = userService.getUserStatus().get(user);
            userStatus.push({
                user: user,
                status: status
            });
        })
        
        ans.push({
            name: team.getName(),
            owner: team.getOwner(),
            password: team.getPassword(),
            users: userStatus,
            bio: team.getBio(),
            maxUsers: team.getMaxUsers()
        })
    });
    res.status(HTTP_status.AUTHORIZED).json({ teams: ans });

}

export default {
    create_team,
    join_team,
    leave_team,
    delete_team,
    get_all_teams
}