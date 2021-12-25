import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatDialogRef } from '@angular/material/dialog';
import { UPDATE_PASSWORD } from 'src/utils/constants';
import { HttpClient} from '@angular/common/http';
import { Title } from 'src/app/model/Iresponse';
import { UserService } from 'src/app/services/index/user/user.service';
import { RegisterDialogComponent } from 'src/app/components/register-dialog/register-dialog.component';
import { MAT_DIALOG_DATA} from '@angular/material/dialog';
import { ThemesService } from 'src/app/services/index/themes.service';

export interface DialogData {
  previousPassword: string;
}

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent implements OnInit {
  hide: boolean = true;
  hide2nd: boolean = true;

  validPassword: boolean = false;

  passwordInput: string = '';
  passwordConfirmInput: string = '';

  errors: Array<string> = [];


  currentColor: string = this.themesService.getCurrentTheme();

  constructor(public dialog: MatDialog, private http: HttpClient, private themesService:ThemesService, private userService: UserService, public dialogRef: MatDialogRef<ChangePasswordComponent>, @Inject(MAT_DIALOG_DATA) public data: DialogData) { }

  ngOnInit(): void {
  }

  checkPasswordValidity(){
    if(this.passwordInput.trim() != "" && this.passwordConfirmInput.trim() != ""){
      this.validPassword = true;
    }else{
      this.validPassword = false;
    }
  }

  validateUserPassword(){
    let regex = new Array();
    regex.push("[A-Z]"); //Uppercase Alphabet.
    regex.push("[a-z]"); //Lowercase Alphabet.
    regex.push("[0-9]"); //Digit.
 
    let passed = 0;
 
    //Validate for each Regular Expression.
    for (let i = 0; i < regex.length; i++) {
        if (new RegExp(regex[i]).test(this.passwordInput)) {
            passed++;
        }
    }
    if(passed < 3){
      this.errors.push("Votre mot de passe ne respecte pas les exigences requises. Veuillez vous fier à l'aide (?)")
    }

    if (this.passwordInput.length > 0 && this.passwordInput.length < 8) {
      this.errors.push("Votre mot de passe n'est pas d'une longeur minimale de 8 caratères.")
    }
  }

  confirmUserPassword(){
    if(this.passwordInput != this.passwordConfirmInput){
      this.errors.push("Vos deux mots de passe ne se correspondent pas.")
    }
  }

  handlePasswordValidity(event: KeyboardEvent) {
    let regex = new RegExp("^[a-zA-ZÀ-ÿ0-9]+$");
    let key = String.fromCharCode(!event.charCode ? event.which : event.charCode);
    if (!regex.test(key)) {
      event.preventDefault();
    }
  }

  cancelCreation(): void {
    this.dialogRef.close('');
  }

  attemptPasswordChange(): void {
    this.errors = [];
    this.validateUserPassword();
    this.confirmUserPassword();

    if(this.passwordInput.trim() == this.data.previousPassword || this.passwordConfirmInput.trim() == this.data.previousPassword){
      this.errors.push("Vous ne pouvez changer à votre mot de passe courant")
    }

    if(this.errors.length !== 0){
      this.openErrorsDialog();
    }else{
      this.http.post(UPDATE_PASSWORD, { user: this.userService.getCurrentUsername(), password: this.passwordInput.trim()}).subscribe((res: any) => {
        console.log(res);
        if(res.title == Title.AUTHORIZED) {
          this.dialogRef.close(this.passwordInput.trim());
        }
      });
    }
  }


  openPasswordhelperDialog(): void {
    this.dialog
        .open(RegisterDialogComponent, {
            width: '500px',
            data: {usernameHelper: false, passwordHelper: true, errorList: [], isRegister: false},
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
