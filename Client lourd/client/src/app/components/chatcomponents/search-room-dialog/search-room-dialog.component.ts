import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/services/index/user/user.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {USER_UNJOINED_ROOMS} from 'src/utils/constants'
import { MatDialogRef} from '@angular/material/dialog';
import { ThemesService } from 'src/app/services/index/themes.service';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json'
  }),
};

@Component({
  selector: 'app-search-room-dialog',
  templateUrl: './search-room-dialog.component.html',
  styleUrls: ['./search-room-dialog.component.scss']
})
export class SearchRoomDialogComponent implements OnInit {
  allRooms:string []= [];
  roomList:string[] = [];

  filterSearch: string = '';
  choosenRoom: string = '';


  currentColor: string = this.themesService.getCurrentTheme();

  constructor(public dialogRef: MatDialogRef<SearchRoomDialogComponent>, private http: HttpClient, private userService: UserService, private themesService:ThemesService) { }

  ngOnInit() {
    this.http.post<any>(USER_UNJOINED_ROOMS, {user: this.userService.getCurrentUsername()}, httpOptions).subscribe((data: any) => {
      data.rooms.forEach((room: any) => {
        let roomName : String = room.name;
        if(!roomName.startsWith('ROOM_TEAM') && !roomName.startsWith('ROOM_DRAWING')){
          this.allRooms.push(room.name)
          this.roomList.push(room.name)
        }
      });
    });

  }

  chooseRoom(room: string){
    this.choosenRoom = room.trim();
    this.dialogRef.close(this.choosenRoom);
  }

  updateAvailableRoom(event: KeyboardEvent) {
    if (event.key == "Backspace") {
      this.roomList = this.allRooms;
    }
    this.filterRooms();
  }

  filterRooms() {
    let newList: string[]= [];
    for(let room of this.roomList) {
      if(room.toLowerCase().includes(this.filterSearch.toLowerCase())){
        newList.push(room);
      }
    }
    this.roomList = newList;
  }

}
