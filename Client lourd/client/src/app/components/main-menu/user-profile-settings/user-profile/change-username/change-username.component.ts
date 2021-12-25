import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatDialog } from '@angular/material/dialog';
import { HttpClient, HttpErrorResponse} from '@angular/common/http';
import { UPDATE_USERNAME } from 'src/utils/constants';
import { Title, Status } from 'src/app/model/Iresponse';
import { UserService } from 'src/app/services/index/user/user.service';
import { RegisterDialogComponent } from 'src/app/components/register-dialog/register-dialog.component';
import { ThemesService } from 'src/app/services/index/themes.service';

@Component({
  selector: 'app-change-username',
  templateUrl: './change-username.component.html',
  styleUrls: ['./change-username.component.scss']
})
export class ChangeUsernameComponent implements OnInit {
  newUsername: String = "";
  validUsername: boolean = false;
  errors: Array<string> = [];

  currentColor: string = this.themesService.getCurrentTheme();

  constructor(public dialog: MatDialog, private http: HttpClient, private themesService:ThemesService, private userService: UserService, public dialogRef: MatDialogRef<ChangeUsernameComponent>) { }

  ngOnInit(): void {
  }

  checkNameValidity(){
    if(this.newUsername.trim() == ""){
      this.validUsername = false;
    }else{
      this.validUsername = true;
    }
  }

  cancelCreation(): void {
    this.dialogRef.close('');
  }

  confirmCreation(): void {
    this.http.post(UPDATE_USERNAME, { user: this.userService.getCurrentUsername(), newUser: this.newUsername.trim()}).subscribe((res: any) => {
      console.log(res);
      if(res.title == Title.AUTHORIZED) {
      this.userService.setCurrentUsername(this.newUsername.trim());
      this.dialogRef.close(this.newUsername.trim());
      }
      },
      (failure: HttpErrorResponse) => {
        console.log(failure);
        if (failure.status == Status.USERNAME_ALREADY_EXISTS) {
          this.errors = [];
          if(this.newUsername.trim() == this.userService.getCurrentUsername()){
            this.errors.push('Vous ne pouvez pas changer à votre pseudonyme courant');
          }else{
            this.errors.push('Ce pseudonyme existe déjà');
          }
          this.openErrorsDialog();
        }
      });
  }

  handleUserNameValidity(event: KeyboardEvent) {
    if (event.key == "Enter") {
      this.confirmCreation();
    }else{
      let regex = new RegExp("^[a-zA-ZÀ-ÿ0-9]+$");
      let key = String.fromCharCode(!event.charCode ? event.which : event.charCode);
      if (!regex.test(key)) {
        event.preventDefault();
      }
    }
    
  }

  openUsernamehelperDialog(): void {
    this.dialog
        .open(RegisterDialogComponent, {
            width: '500px',
            data: {usernameHelper: true, passwordHelper: false, errorList: [], isRegister: false},
            panelClass: this.themesService.getThemesModalColor()
        })
  }

  openErrorsDialog(): void {
    this.dialog
        .open(RegisterDialogComponent, {
            width: '500px',
            data: {usernameHelper: false, passwordHelper: false, errorList: this.errors, isRegister: false},
            panelClass: this.themesService.getThemesModalColor()
        })
  }
}
