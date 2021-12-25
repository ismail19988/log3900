import { Injectable } from '@angular/core';
import { io, Socket } from "socket.io-client";
import { UserService } from 'src/app/services/index/user/user.service';
import { BASE_URL } from 'src/utils/constants';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket : Socket;
  public socketInitiated = false;

  public toolsInited = false;
  public versions = false;

  constructor(
    private userService: UserService
  ) { }

  initSocket() {
    if(!this.socketInitiated) {
      this.socket = io(BASE_URL,
      {
        reconnectionAttempts: 2,
        transports : ['websocket'],
        query : { user: this.userService.getCurrentUsername() }
      });
      this.socketInitiated = true;
    }
  }

  getSocket() {
    return this.socket;
  }

  disconnectSocket() {
    this.socketInitiated = false;
    this.toolsInited = false;
    this.versions = false;
    this.socket.close();
  }
}
