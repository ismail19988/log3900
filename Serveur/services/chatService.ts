import { Server, Socket } from 'socket.io'
import { Room } from '../classes/room';
import { VectorObjectClass } from '../classes/shapes/vectorObject';
import logging from '../config/logging';
import { IMessage, IMessageDB } from '../interfaces/chat/IMessage';
import { IRoomDB } from '../interfaces/chat/room';
import DatabaseService from './databaseService';
import drawingService from './drawingService';
import socketService from './socketService';
import userService, { action, status } from './UserService';

class chatService {

    private NAMESPACE = "Chat service"
    private io: Server;
    private rooms = new Map<string, Room>();

    public async init(server : Server) {
        this.io = server;
        this.setUPConnection();

        /** Load all rooms from database and add them to the map */
        await DatabaseService.getAllRooms()
        .then((existing_rooms: Array<IRoomDB>) => {
            existing_rooms.forEach((room: IRoomDB) => {
                let room_instance = new Room(room.name, room.owner, room.history, room.users, room.password);
                this.rooms.set(room_instance.getName(), room_instance);
            });
        })
        .catch((error) => {
            logging.error(this.NAMESPACE, error.message);
        })
    }

    public setUPConnection() {
        this.io.on("connection", async (socket: Socket) => {

            let user: any = socket.handshake.query.user;
            if(!user || user == undefined) {
                logging.info(this.NAMESPACE, "Undefined User tried to login, connection refused");
            }

            else {
                userService.SetSocket(socket.id, user);
                logging.info(this.NAMESPACE, "User [" + user + "] just connected to the chat !");
                // setup socket for previously connected rooms
                ChatService.getRooms().forEach((room : Room) => {
                    if (room.hasUser(user)) {
                        let roomName = room.getName()
                        socket.join(roomName)
                        room.connectUser(user)
                        logging.info(this.NAMESPACE, "User [" + user + "] joined the room [" + roomName + "].");
                    }
                });
                this.io.emit('connected', { user: user })
                // logging.info(this.NAMESPACE, "User [" + user +"] joined the room [General].");
                // this.io.to("General").emit("join_room", { room : "General", user : user });
                this.message(socket);
                this.disconnect(socket);
            }
        })
    }

    /**
    * 
    * emits back to client :
    *      "leave_room",
    *      (
    *          params :
    *              for every other user in the rooms in which the user was :
    *                           {
    *                               room    :   (string),            [roomName],
    *                               user   :   (Array<string>)     [the user that left the room]
    *                           };
    *      )
    *      
    */

    disconnect(socket: Socket) {
        socket.on('disconnect', () => {
            let user = userService.getUserFromSocketID(socket.id);
            const timestamp = Date.now()
            if(user) {

                let object = drawingService.getSelectedObjects().get(user);

                if (object) {
                    drawingService.getSelectedObjects().delete(user);
                    object[0].setIsSelected(false);

                    const SOCKET_ROOM_PREFIX = "DRAWING_"
                    socketService.getServer().in(SOCKET_ROOM_PREFIX + object[1])
                    .emit('unselect', {
                        name: object[1],
                        user: user,
                        id: (object[0] as VectorObjectClass).getId()
                    });
                    console.log("Unselected object [" + (object[0] as VectorObjectClass).getId() + "]. Previously selected by user [" + user + "]");
                }

                userService.deleteSocket(socket.id, user);
                logging.info(this.NAMESPACE, "User [" + user + "] left the chat due to a disconnected socket.");
                this.rooms.forEach(room => {
                    if(room.hasUser(user as string)) {
                        logging.info(this.NAMESPACE, "User [" + user + "] disconnected from the room [" + room.getName() +  "] due to a disconnected socket.");
                        socket.leave(room.getName());
                        room.disconnectUser(user as string);
                    }
                });
                userService.disconnectUser(user as string);
                this.io.emit('disconnected', { user: user });
                this.io.emit('change_status', { user: user, status: status.DISCONNECTED });

                let email = userService.getUsers().get(user)?.getEmail() as string;
                
                DatabaseService.updateUserLastDeconnection(email, timestamp).then(() => {
                    const newAction = {
                        action: action.LOGOUT,
                        timestamp: timestamp,
                        drawing: null
                    }
                    DatabaseService.updateUserLastAction(email, newAction)
                    .then(() => {
                        userService.getUsers().get(user as string)?.setLastDeconnection(Date.now())
                        userService.getUsers().get(user as string)?.addLastAction(newAction)
                    });
                })

                logging.info(this.NAMESPACE, "User [" + user + "] left the drawing due to a disconnected socket.");
                const SOCKET_ROOM_PREFIX = 'DRAWING_';
                drawingService.getDrawings().forEach(drawing => {
                    if(drawing.hasUser(user as string)) {
                        logging.info(this.NAMESPACE, "User [" + user + "] disconnected from the room [" + drawing.getName() +  "] due to a disconnected socket.");
                        socket.leave(SOCKET_ROOM_PREFIX + drawing.getName());
                        drawing.disconnectUser(user as string);
                    }
                });
                this.rooms.forEach(room => {
                    if (room.hasUser(user as string) && (room.getName().startsWith("ROOM_DRAWING_"))) {
                        room.disconnectUser(user as string);
                        room.deleteUser(user as string);

                        socketService.getServer().in(room.getName()).emit('leave_room', { room : room.getName(), users: [user] });
                    }
                })
                userService.disconnectUser(user as string);
            }
        })
    }




    /**
     * 
     * params : {
     *      room: string          [room name],
     *      message: (IMessage)
     *      {
     *         content     :   (string),         [The text message]
     *         sender      :   (string),         [the sender]
     *         timestamp   :   (int),            [unix Timestamp]
     *      } 
     * }
     * 
     */

    /**
     * 
     * emits back to client :
     *      "send_message",
     *      (
     *          params :
     *              for every user in the room (including sender) :
     *                   {
     *                      room : (string),   [room name]
     *                      message: (IMessage)
     *                          [{
     *                              content     :   (string),         [The text message]
     *                              sender      :   (string),         [the sender]
     *                              timestamp   :   (int),            [unix Timestamp]
     *                          }]
     *                   };
     *      )
     *      
     */


    private message(socket: Socket) {
        socket.on("send_message", (params: any) => {
            /** try - catch */
            const parsed_param = JSON.parse(params);

            let roomName = parsed_param.room;
            let message: IMessage = parsed_param.message;
            message.timestamp = Date.now() / 1000;

            
            if(message && message.sender && message.content && roomName && this.rooms.has(roomName)) {
                if(this.rooms.get(roomName)?.hasUser(message.sender)) {

                    logging.info(this.NAMESPACE, "User [" + message.sender + "] sent [" + message.content + "] to Room [" + roomName + "].");
                    /** DB query */
                    let messageToStore = {
                        content     : message.content,
                        sender      : message.sender,
                        timestamp   : message.timestamp,
                        avatar      : userService.getUsers().get(message.sender)?.getAvatar()
                    } as IMessageDB

                    DatabaseService.logRoomMessage(roomName, messageToStore)
                    .then(() => {
                        logging.debug(this.NAMESPACE, "Successfully logged message in database!");

                        // Send Message to other people in the room
                        this.io.in(roomName).emit("send_message", { room: roomName, message: messageToStore });

                        // Save message in Room
                        this.rooms.get(roomName)?.pushMessage(messageToStore);
                    })
                    .catch((error) => {
                        logging.debug(this.NAMESPACE, "Error while trying to save message in database.");
                        socket.emit("chat_error", {title : "send_message", message : "Failed to save in database"})
                    })
                }
                
                else {
                    logging.info(this.NAMESPACE, "User [" + message.sender + "]" + "tried to join room [" + roomName + "], but he was already in it.");

                    socket.emit("chat_error", { title : "send_message", message : "User not in room"});
                }
            }
            
            else if(!this.rooms.has(roomName) && roomName) {
                if(message)
                    logging.info(this.NAMESPACE, "User [" + message.sender + "]" + "tried to send a message to [" + roomName + "], but it wasn't found.");
                socket.emit("chat_error", { title : "send_message", message : "Room doesn't exist"});
            }

            else if(!roomName) {
                if(message)
                    logging.info(this.NAMESPACE, "User [" + message.sender + "]" + "tried to send a message to a room but room name wasn't specified");
                socket.emit("chat_error", { title : "send_message", message : "Room name has not been provided."});
            }
            
            else if(!message) {
                logging.info(this.NAMESPACE, "A user tried to send a message to [" + roomName + "], but the message wasn't provided.");
                socket.emit("chat_error", { title : "send_message", message : "Message has not been provided." });
            }

            else if(!message.sender) {
                logging.info(this.NAMESPACE, "A user tried to send a message to [" + roomName + "], but the message sender wasn't provided.");
                socket.emit("chat_error", { title : "send_message", message : "Message sender has not been provided." });
            }

            else if(!message.content) {
                logging.info(this.NAMESPACE, "A user tried to send a message to [" + roomName + "], but the message content wasn't provided.");
                socket.emit("chat_error", { title : "send_message", message : "Message content has not been provided." });
            }
            
        }) 
    }
    
    public getRooms():Map<string, Room>{
        return this.rooms;
    }
}


let ChatService: chatService = new chatService();

export default ChatService;