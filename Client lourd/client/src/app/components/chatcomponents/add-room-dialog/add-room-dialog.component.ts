import { Component, OnInit} from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { UserService } from 'src/app/services/index/user/user.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {CREATE_ROOM} from 'src/utils/constants'

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json'
  }),
};

@Component({
  selector: 'app-add-room-dialog',
  templateUrl: './add-room-dialog.component.html',
  styleUrls: ['./add-room-dialog.component.scss']
})
export class AddRoomDialogComponent implements OnInit {
  newRoom: string = '';
  validName: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<AddRoomDialogComponent>, private http: HttpClient, private userService: UserService) { }

  ngOnInit() {
  }

  checkNameValidity(event: KeyboardEvent){
    if(this.newRoom.trim() == ""){
      this.validName = false;
    }else{
      this.validName = true;
      if (event.key == "Enter") {
        this.confirmCreation();
      }
    }
  }

  cancelCreation(): void {
    this.dialogRef.close('');
  }

  confirmCreation(): void {
    this.http.post<any>(CREATE_ROOM, {user: this.userService.getCurrentUsername(), room: this.newRoom.trim()}, httpOptions).subscribe((data: any) => {
      this.dialogRef.close(this.newRoom.trim());
    });
  }

}
