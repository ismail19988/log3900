import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { IResponse, Status } from  '../../model/Iresponse';
import * as EmailValidator from 'email-validator';
import { DrawingSvgService } from 'src/app/services/index/drawing/drawing-svg.service';
import { RegisterDialogComponent } from './../register-dialog/register-dialog.component';
import {REGISTER_LOGIN} from 'src/utils/constants'
import { MatDialog } from '@angular/material/dialog';
import { RegisterAvatarComponent } from '../register-avatar/register-avatar.component';
import { avatarService } from 'src/app/services/index/user/avatar.service';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json'
  }),
};


@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  hide: boolean = true;
  hide2nd: boolean = true;

  nameInput: string = '';
  familynameInput: string = '';
  emailInput: string = '';
  usernameInput: string = '';
  passwordInput: string = '';
  passwordConfirmInput: string = '';

  errorList: Array<string> = [];

  constructor(
    public dialog: MatDialog,
    private router: Router,
    private http: HttpClient,
    public drawingSvgService: DrawingSvgService,
    public avatarService: avatarService
  ) { }

  ngOnInit() {
    //console.log(this.avatarService.getPreviewAvatar());
  }

  setRegisteredAvatar(){
    let image = this.avatarService.getPreviewAvatar();
    console.log(this.avatarService.getPreviewAvatar());
    (<HTMLElement>document.getElementById('profile-image')).setAttribute('src', image);
  }

  validateUserFirstName(){
    if(this.nameInput.length == 0){
      this.errorList.push("Votre prénom est vide.")
    }
  }

  validateUserLastname(){
    if(this.usernameInput.length == 0){
      this.errorList.push("Votre pseudonyme est vide.")
    }
  }

  validateUserEmail(){
    let emailIsValid = EmailValidator.validate(this.emailInput);
    
    if(this.emailInput.length == 0){
      this.errorList.push("Votre courriel est vide.");
    }else if(!emailIsValid){
      this.errorList.push("Votre courriel n'est pas en format valide.");
    }
  }

  validateUserName(){
    if(this.nameInput.length == 0){
      this.errorList.push("Votre prénom est vide")
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

    if(this.passwordInput.length == 0){
      this.errorList.push("Votre mot de passe est vide.")
    }
    else if(passed < 3){
      this.errorList.push("Votre mot de passe ne respecte pas les exigences requises. Veuillez vous fier à l'aide (?)")
    }

    if (this.passwordInput.length > 0 && this.passwordInput.length < 8) {
      this.errorList.push("Votre mot de passe n'est pas d'une longeur minimale de 8 caratères.")
    }
  }

  confirmUserPassword(){
    if(this.passwordConfirmInput.length == 0){
      this.errorList.push("Votre confirmation de mot de passe est vide.")
    }
    else if(this.passwordInput != this.passwordConfirmInput){
      this.errorList.push("Vos deux mots de passe ne se correspondent pas.")
    }
  }


  handleUserPrivateNamesValidity(event: KeyboardEvent) {
    let regex = new RegExp("^[a-zA-ZÀ-ÿ]+$");
    let key = String.fromCharCode(!event.charCode ? event.which : event.charCode);
    if (!regex.test(key)) {
      event.preventDefault();
   }
  }

  handleUserNameValidity(event: KeyboardEvent) {
    let regex = new RegExp("^[a-zA-ZÀ-ÿ0-9]+$");
    let key = String.fromCharCode(!event.charCode ? event.which : event.charCode);
    if (!regex.test(key)) {
      event.preventDefault();
   }
  }


  attemptRegistration() {
    this.errorList = []
    this.validateUserFirstName();
    this.validateUserLastname();
    this.validateUserEmail();
    this.validateUserName();
    this.validateUserPassword();
    this.confirmUserPassword();

    if(this.errorList.length != 0){
      this.openRegisterErrorsDialog();
    }
    
    else {
      let avatar = this.avatarService.getAvatar();

      let data = {"firstname": this.nameInput.trim(),"lastname": this.familynameInput.trim(), "email": this.emailInput.trim(),"username": this.usernameInput.trim(), "password": this.passwordInput.trim(), "avatar": avatar}
      this.http.post<any>(REGISTER_LOGIN, data, httpOptions).subscribe((data: IResponse) => {
        this.goToLoginPage();
      },
      (connectFailure : HttpErrorResponse) => {   
        console.log(connectFailure);
        if (connectFailure.status == Status.EMAIL_ALREADY_EXISTS) {
          this.errorList.push("Il éxiste déjà un utilisateur associé à ce courriel.")
        }
        if (connectFailure.status == Status.USERNAME_ALREADY_EXISTS) {
          this.errorList.push("Il éxiste déjà un utilisateur associé à ce pseudonyme.")
        }
        this.openRegisterErrorsDialog();
      }
      );
      this.avatarService.setPreviewAvatar("https://firebasestorage.googleapis.com/v0/b/log3900-102.appspot.com/o/pepe%2Fpeepolove.png?alt=media&token=e2f5c89a-5479-43ae-bf3e-7db3ab7de856");
    }
  }

  goToLoginPage() {
    this.router.navigate(['/']);
  }

  openUsernamehelperDialog(): void {
    this.dialog
        .open(RegisterDialogComponent, {
            width: '500px',
            data: {usernameHelper: true, passwordHelper: false, errorList: [], isRegister: true},
            panelClass: 'register-helper-dialog'
        })
  }
  openPasswordhelperDialog(): void {
    this.dialog
        .open(RegisterDialogComponent, {
            width: '500px',
            data: {usernameHelper: false, passwordHelper: true, errorList: [], isRegister: true},
            panelClass: 'register-helper-dialog'
        })
  }
  openRegisterErrorsDialog(): void {
    this.dialog
        .open(RegisterDialogComponent, {
            width: '500px',
            data: {usernameHelper: false, passwordHelper: false, errorList: this.errorList, isRegister: true},
            panelClass: 'register-error-dialog'
        })
  }
  openAvatarDialog(): void {
    let dialogRef = this.dialog
        .open(RegisterAvatarComponent, {
            width: '1200px',
            data: {isRegister: true},
            panelClass: 'register-avatars-dialog'
        })
        dialogRef.afterClosed().subscribe(result => {
          if(result == 'apply'){
            this.setRegisteredAvatar();
          }
        });
  }

}
