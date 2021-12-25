import { Component, AfterViewInit, ViewChild, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { UserService } from 'src/app/services/index/user/user.service';
import { SocketService } from 'src/app/services/index/helperServices/socket.service';
import { ChatService } from 'src/app/services/index/chat/chatService';
import { USER_JOINED_ROOMS, JOIN_ROOM, LEAVE_ROOM, DELETE_ROOM } from 'src/utils/constants';
import { trigger, style, animate, transition } from '@angular/animations';
import { SearchRoomDialogComponent } from '../search-room-dialog/search-room-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { AddRoomDialogComponent } from '../add-room-dialog/add-room-dialog.component';
import { ThemesService } from 'src/app/services/index/themes.service';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json'
  }),
};

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
  animations: [
    trigger(
      'inOutAnimation',
      [
        transition(
          ':enter',
          [
            style({ opacity: 0, transform: 'translateX(-5px)' }),
            animate('1s',
              style({ opacity: 1, transform: 'translateX(0px)' }))
          ]
        ),
        transition(
          ':leave',
          [
            style({ opacity: 1, transform: 'translateX(0px)' }),
            animate('0s',
              style({ opacity: 0, transform: 'translateX(-2px)' }))
          ]
        )
      ]
    )
  ]
})
export class ChatComponent implements AfterViewInit {
  currentRoom: string = "";
  message: string = "";

  messageList: Map<String, { message: string, userName: string, avatar: string, time: string, mine: boolean }[]> = new Map();
  userList: Map<String, { name: string, active: boolean }[]> = new Map();
  roomOwner: Map<String, String> = new Map();
  roomList: string[] = [];
  regularRoomList: string[] = [];
  teamRoomList: string[] = [];
  drawingRoomList: string[] = [];

  show_rooms_list: boolean = false;
  buttonName: string = '<<';
  containerSize: string = this.chatService.getChatWindowSize();

  @ViewChild('scrollMe') scrollme: any;
  @ViewChildren("messageContainer") messageContainers: QueryList<ElementRef>;

  constructor(
    private http: HttpClient,
    private userService: UserService,
    private socketService: SocketService,
    private chatService: ChatService, 
    public dialog: MatDialog,
    private themesService:ThemesService
  ) { this.socketService.initSocket(); }

  ngAfterViewInit(): void {
    this.http.post<any>(USER_JOINED_ROOMS, { user: this.userService.getCurrentUsername() }, httpOptions).subscribe((data: any) => {
      this.currentRoom = data.rooms[0].name;

      data.rooms.forEach((room: any) => {
        this.roomList.push(room.name);

        if(room.name.startsWith('ROOM_TEAM')){
          this.teamRoomList.push(room.name);
        }
        else if(room.name.startsWith('ROOM_DRAWING')){
          this.drawingRoomList.push(room.name);
        }
        else{
          this.regularRoomList.push(room.name);
        }

        this.roomOwner.set(room.name, room.owner);
        this.userList.set(room.name, new Array<{ name: string, active: boolean }>())
        room.users.forEach((loggedUser: string) => {
          let array = this.userList.get(room.name);
          array !== undefined && array.push({ name: loggedUser, active: room.connectedUsers.includes(loggedUser) });
        });

        this.messageList.set(room.name, new Array<{ message: string, userName: string, avatar: string, time: string, mine: boolean }>())
        room.history.forEach((message: any) => {
          //console.log(message)
          let array = this.messageList.get(room.name);
          array !== undefined && array.push({ message: message.content, userName: message.sender, avatar: message.avatar, time: this.getTime(message.timestamp), mine: this.userService.getCurrentUsername() === message.sender })
        });
      });
    });

    try {
      this.initChat()
    } catch (error) {
      console.log('user not logged in!')
    }

    this.scrollToBottom(); // For messsages already present
    this.messageContainers.changes.subscribe((list: QueryList<ElementRef>) => {
      this.scrollToBottom(); // For messages added later
    });
  }

  scrollToBottom() {
    try {
      (<HTMLElement>document.getElementById('chatbox__messages_container')).scrollTop = this.scrollme.nativeElement.scrollHeight;
    } catch (err) {
      console.log(err)
    }
  }

  showHideRoomsList() {
    this.show_rooms_list = !this.show_rooms_list;
    // CHANGE THE NAME OF THE BUTTON.
    if (this.show_rooms_list)
      this.buttonName = ">>";
    else
      this.buttonName = "<<";
  }


  getRoomName(room: string) {
    let roomName: string = room;
    if(room.startsWith('ROOM_TEAM') || room.startsWith('ROOM_DRAWING')) {
      roomName = room.split('_')[2];
      return roomName;
    }else {
      return roomName;
    }
  }


  playMessagePingAudio(){
    let audio = new Audio();
    audio.src = "../../../assets/message_ping.wav";
    audio.volume = 0.5;
    audio.load();
    audio.play();
  }

  initChat() {
    this.socketService.getSocket().on('chat_error', (params: any) => { console.log('chat_error', params) });

    this.socketService.getSocket().on('send_message', (params: any) => {
      //console.log(params)
      let array = this.messageList.get(params.room);
      array !== undefined && array.push({ message: params.message.content, userName: params.message.sender,  avatar: params.message.avatar, time: this.getTime(params.message.timestamp), mine: this.userService.getCurrentUsername() === params.message.sender });
      
      if(this.userService.getCurrentUsername() !== params.message.sender){
        this.playMessagePingAudio();
      }
    });

    this.socketService.getSocket().on('connected', (params: any) => {
      this.userList.forEach((values, keys) => {
        values.forEach((user) => {
          if (user.name === params.user) {
            user.active = true;
          }
        })
      })
    });

    this.socketService.getSocket().on('disconnected', (params: any) => {
      this.userList.forEach((values, keys) => {
        values.forEach((user) => {
          if (user.name === params.user) {
            user.active = false;
          }
        })
      })
    });

    this.socketService.getSocket().on('join_room', (params: any) => {
      let array = this.userList.get(params.room);
      array !== undefined && array.push({ name: params.user, active: true });
      if(params.user == this.userService.getCurrentUsername()){
        //console.log('current user')
        this.http.post<any>(USER_JOINED_ROOMS, { user: this.userService.getCurrentUsername() }, httpOptions).subscribe((data: any) => {
          data.rooms.forEach((room: any) => {
            if(room.name == params.room){
              if(!this.roomList.includes(params.room)){
                this.roomList.push(room.name);

                if(room.name.startsWith('ROOM_TEAM')){
                  this.teamRoomList.push(room.name);
                }else if(room.name.startsWith('ROOM_DRAWING')){
                  this.drawingRoomList.push(room.name);
                }else{
                  this.regularRoomList.push(room.name);
                }

                this.roomOwner.set(room.name, room.owner);
                this.userList.set(room.name, new Array<{ name: string, active: boolean }>())
                room.users.forEach((loggedUser: string) => {
                  let array = this.userList.get(room.name);
                  array !== undefined && array.push({ name: loggedUser, active: room.connectedUsers.includes(loggedUser) });
                });
        
                this.messageList.set(room.name, new Array<{ message: string, userName: string, avatar: string, time: string, mine: boolean }>())
                room.history.forEach((message: any) => {
                  let array = this.messageList.get(room.name);
                  array !== undefined && array.push({ message: message.content, userName: message.sender, avatar: message.avatar, time: this.getTime(message.timestamp), mine: this.userService.getCurrentUsername() === message.sender })
                });
              }
            }
          })
        })
      }
    });


    this.socketService.getSocket().on('leave_room', (params: any) => {
      console.log('leaving', params);

      if(params.users == this.userService.getCurrentUsername()){
        const index = this.roomList.indexOf(params.room);
        if (index > -1) {
          this.roomList.splice(index, 1);
        }
        const index1 = this.teamRoomList.indexOf(params.room);
        if (index1 > -1) {
          this.teamRoomList.splice(index1, 1);
        }
        const index2 = this.drawingRoomList.indexOf(params.room);
        if (index2 > -1) {
          this.drawingRoomList.splice(index2, 1);
        }
        const index3 = this.regularRoomList.indexOf(params.room);
        if (index3 > -1) {
          this.regularRoomList.splice(index3, 1);
        }

        this.roomOwner.delete(params.room)
        this.messageList.delete(params.room)

        return;
      }

      let affectedRoom = this.userList.get(params.room) as Array<{ name: string, active: boolean }>;

      params.users.forEach((leavingUser: string) => {
        let index = -1;
        affectedRoom.forEach((presentUser) => {
          if (presentUser.name === leavingUser) {
            index = affectedRoom.indexOf(presentUser);
          }
        });
        if (index !== -1) {
          let array = this.userList.get(params.room);
          array !== undefined && array.splice(index, 1);
        }
      });
    });

    this.socketService.getSocket().on('delete_room', (params: any) => {
      this.roomOwner.delete(params.room);

      let index = -1;
      this.roomList.forEach((room: string) => {
        if (room === params.room) {
          index = this.roomList.indexOf(room);
        }
      });
      if (index !== -1) {
        this.roomList.splice(index, 1);
      }

      let index1 = -1;
      this.regularRoomList.forEach((room: string) => {
        if (room === params.room) {
          index1 = this.regularRoomList.indexOf(room);
        }
      });
      if (index1 !== -1) {
        this.regularRoomList.splice(index1, 1);
      }

      let index2 = -1;
      this.drawingRoomList.forEach((room: string) => {
        if (room === params.room) {
          index2 = this.drawingRoomList.indexOf(room);
        }
      });
      if (index2 !== -1) {
        this.drawingRoomList.splice(index2, 1);
      }

      let index3 = -1;
      this.teamRoomList.forEach((room: string) => {
        if (room === params.room) {
          index3 = this.teamRoomList.indexOf(room);
        }
      });
      if (index3 !== -1) {
        this.teamRoomList.splice(index3, 1);
      }

      if (this.currentRoom === params.room) {
        this.currentRoom = 'General';
      }

      this.userList.delete(params.room);
      this.messageList.delete(params.room);
    });
  }

  sendMessage(): void {
    if (this.message.trim() == "") {
      return
    } else {
      console.log(this.currentRoom);
      this.socketService.getSocket().emit("send_message", JSON.stringify({ room: this.currentRoom, message: { content: this.message, sender: this.userService.getCurrentUsername() } }));
    }
    this.message = '';
  }

  getTime(timestamp: number): string {
    let date = new Date(timestamp * 1000);

    let hours = date.getHours();
    // Minutes part from the timestamp
    let minutes = "0" + date.getMinutes();
    // Seconds part from the timestamp
    let seconds = "0" + date.getSeconds();

    let formattedTime = hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);

    return formattedTime

  }

  handleKeypress(event: KeyboardEvent) {
    if (event.key == "Enter") {
      this.sendMessage();
    }
  }

  chooseRoom(event: MouseEvent) {
    let choosenRoom = (<HTMLElement>event.target).innerHTML;
    this.currentRoom = choosenRoom.trim();
  }

  chooseDrawingRoom(event: MouseEvent) {
    let choosenRoom = (<HTMLElement>event.target).innerHTML;
    this.currentRoom = 'ROOM_DRAWING_' + choosenRoom.trim();
  }

  chooseTeamRoom(event: MouseEvent) {
    let choosenRoom = (<HTMLElement>event.target).innerHTML;
    this.currentRoom = 'ROOM_TEAM_' + choosenRoom.trim();
  }


  leaveChatRoom(event: MouseEvent) {
    let currentRoom = this.currentRoom;

    let roomToLeave = (<HTMLElement>(<HTMLElement>(<HTMLElement>event.target).parentNode).lastChild).textContent;
    roomToLeave = String(roomToLeave).trim();

    this.http.post<any>(LEAVE_ROOM, { user: this.userService.getCurrentUsername(), room: (roomToLeave as String) }, httpOptions).subscribe((data: any) => {

      this.roomOwner.delete((roomToLeave as String));

      let index = -1;
      this.roomList.forEach((room: string) => {
        if (room === (roomToLeave as String)) {
          index = this.roomList.indexOf(room);
        }
      });
      if (index !== -1) {
        this.roomList.splice(index, 1);
      }

      let index1 = -1;
      this.regularRoomList.forEach((room: string) => {
        if (room === (roomToLeave as String)) {
          index1 = this.regularRoomList.indexOf(room);
        }
      });
      if (index1 !== -1) {
        this.regularRoomList.splice(index1, 1);
      }

      let index2 = -1;
      this.drawingRoomList.forEach((room: string) => {
        if (room === (roomToLeave as String)) {
          index2 = this.drawingRoomList.indexOf(room);
        }
      });
      if (index2 !== -1) {
        this.drawingRoomList.splice(index2, 1);
      }

      let index3 = -1;
      this.teamRoomList.forEach((room: string) => {
        if (room === (roomToLeave as String)) {
          index3 = this.teamRoomList.indexOf(room);
        }
      });
      if (index3 !== -1) {
        this.teamRoomList.splice(index3, 1);
      }

      if (currentRoom === (roomToLeave as String)) {
        this.currentRoom = 'General';
      } else {
        this.currentRoom = currentRoom;
      }

      this.userList.delete((roomToLeave as String));
      this.messageList.delete((roomToLeave as String));

    });
  }

  deleteChatRoom(event: MouseEvent) {
    let currentRoom = this.currentRoom;

    let roomToLeave = (<HTMLElement>(<HTMLElement>(<HTMLElement>event.target).parentNode).lastChild).textContent;
    roomToLeave = String(roomToLeave).trim();

    this.http.post<any>(DELETE_ROOM, { user: this.userService.getCurrentUsername(), room: (roomToLeave as String) }, httpOptions).subscribe((data: any) => {

      this.roomOwner.delete((roomToLeave as String));

      let index = -1;
      this.roomList.forEach((room: string) => {
        if (room === (roomToLeave as String)) {
          index = this.roomList.indexOf(room);
        }
      });
      if (index !== -1) {
        this.roomList.splice(index, 1);
      }
      
      let index1 = -1;
      this.regularRoomList.forEach((room: string) => {
        if (room === (roomToLeave as String)) {
          index1 = this.regularRoomList.indexOf(room);
        }
      });
      if (index1 !== -1) {
        this.regularRoomList.splice(index1, 1);
      }

      let index2 = -1;
      this.drawingRoomList.forEach((room: string) => {
        if (room === (roomToLeave as String)) {
          index2 = this.drawingRoomList.indexOf(room);
        }
      });
      if (index2 !== -1) {
        this.drawingRoomList.splice(index2, 1);
      }

      let index3 = -1;
      this.teamRoomList.forEach((room: string) => {
        if (room === (roomToLeave as String)) {
          index3 = this.teamRoomList.indexOf(room);
        }
      });
      if (index3 !== -1) {
        this.teamRoomList.splice(index3, 1);
      }

      if (currentRoom === (roomToLeave as String)) {
        this.currentRoom = 'General';
      } else {
        this.currentRoom = currentRoom;
      }

      this.userList.delete((roomToLeave as String));
      this.messageList.delete((roomToLeave as String));

    });
  }


  openSearchRoomDialog(): void {
    let dialogRef = this.dialog
      .open(SearchRoomDialogComponent, {
        width: '15%',
        height: '50%',
        data: {},
        panelClass: this.themesService.getThemesModalColor()
      })
    dialogRef.afterClosed().subscribe(result => {
        if(result !== undefined){
        this.http.post<any>(JOIN_ROOM, { user: this.userService.getCurrentUsername(), room: result }, httpOptions).subscribe((data: any) => {
        });
      }
    });
  }

  openAddRoomDialog(): void {
    let dialogRef = this.dialog
      .open(AddRoomDialogComponent, {
        width: '30%',
        height: '25%',
        data: {},
        panelClass: this.themesService.getThemesModalColor()
      })
    dialogRef.afterClosed().subscribe(result => {
    });
  }


}