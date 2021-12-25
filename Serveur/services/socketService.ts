import http from 'http'
import { Server } from 'socket.io';
import ChatService from './chatService';
import drawingService from './drawingService';
import teamService from './TeamService';

class SocketService {
    private io: Server;
    constructor(){

    }

    init(server: http.Server) {
        this.io = new Server(server);
        ChatService.init(this.io);
        drawingService.init(this.io);
        teamService.init(this.io);
    }

    public getServer(): Server{
        return this.io;
    }
}

let socketService: SocketService = new SocketService();

export default socketService;