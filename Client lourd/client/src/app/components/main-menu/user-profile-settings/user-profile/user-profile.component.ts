import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GET_USER_DATA, UPDATE_AVATAR, UPDATE_EMAIL_PRIVACY, UPDATE_FULLNAME_PRIVACY } from 'src/utils/constants';
import { UserService } from 'src/app/services/index/user/user.service';
import { avatarService } from 'src/app/services/index/user/avatar.service';
import { MatDialog } from '@angular/material/dialog';
import { RegisterAvatarComponent } from 'src/app/components/register-avatar/register-avatar.component';
import { ChangeUsernameComponent } from './change-username/change-username.component';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { ThemesService } from 'src/app/services/index/themes.service';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit {
  emailIsChecked: boolean = false;
  nameIsChecked: boolean = false;

  goBack: boolean = false;

  previewAvatar: string = this.avatarService.getPreviewAvatar();
  userAvatar: string = this.avatarService.getPreviewAvatar();

  currentColor: string = this.themesService.getCurrentTheme();

  // Input fields
  inputEmail: String = "";
  inputPrenom: String = "";
  inputName: String = "";
  inputNickname: String = "";
  inputPassword: String = "";

  constructor(public dialog: MatDialog, private http: HttpClient, private userService: UserService, private avatarService: avatarService, private themesService:ThemesService) { }

  ngOnInit(): void {
    this.getUserStats();
  }

  setRegisteredAvatar(){
    let image = this.avatarService.getPreviewAvatar();
    (<HTMLElement>document.getElementById('profile-image')).setAttribute('src', image);

    let avatar = this.avatarService.getAvatar();

    this.http.post(UPDATE_AVATAR, { user: this.userService.getCurrentUsername(), avatar: avatar}).subscribe((res: any) => {
      console.log(res);
    })

  }


  getUserStats() {
    this.http.post(GET_USER_DATA, { user: this.userService.getCurrentUsername()}).subscribe((res: any) => {
      this.inputEmail = res.user.email
      this.inputPrenom = res.user.firstname
      this.inputName = res.user.lastname
      this.inputNickname = res.user.username
      this.inputPassword = res.user.password

      this.emailIsChecked = res.user.isEmailPublic
      this.nameIsChecked = res.user.isNamePublic
    })
  }

  returnToProfileMenu(){
    this.goBack = true;
  }

  hashPassword(password: string){
    return "*".repeat(password.length)
  }

  setEmailPublic(){
    this.http.post(UPDATE_EMAIL_PRIVACY, { user: this.userService.getCurrentUsername(), isEmailPublic: this.emailIsChecked}).subscribe((res: any) => {
      console.log(res);
    });
  }

  setNamePublic(){
    this.http.post(UPDATE_FULLNAME_PRIVACY, { user: this.userService.getCurrentUsername(), isNamePublic: this.nameIsChecked}).subscribe((res: any) => {
      console.log(res);
    });
  }

  openAvatarDialog(): void {
    let dialogRef = this.dialog
        .open(RegisterAvatarComponent, {
            width: '1200px',
            data: {isRegister: false},
            panelClass: this.themesService.getThemesModalColor()
        })
        dialogRef.afterClosed().subscribe(result => {
          if(result == 'apply'){
            this.setRegisteredAvatar();
          }else{
            this.avatarService.setPreviewAvatar(this.previewAvatar);
          }
        });
  }

  openChangeUsernameDialog(): void {
    let dialogRef = this.dialog
      .open(ChangeUsernameComponent, {
        width: '30%',
        height: '25%',
        data: {},
        panelClass: this.themesService.getThemesModalColor()
      })
    dialogRef.afterClosed().subscribe(result => {
      if(result !== '' || result !== undefined){
        this.getUserStats();
      }
    });
  }

  openChangePasswordDialog(): void {
    let dialogRef = this.dialog
      .open(ChangePasswordComponent, {
        width: '30%',
        height: '35%',
        data: {previousPassword: this.inputPassword},
        panelClass: this.themesService.getThemesModalColor()
      })
    dialogRef.afterClosed().subscribe(result => {
      if(result !== '' || result !== undefined){
        this.getUserStats();
      }
    });
  }

}
