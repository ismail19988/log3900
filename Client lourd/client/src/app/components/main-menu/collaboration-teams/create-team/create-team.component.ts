import { Component, OnInit} from '@angular/core';
import { UserService } from 'src/app/services/index/user/user.service';
import { MatDialogRef } from '@angular/material/dialog';
import { HttpClient, HttpHeaders} from '@angular/common/http';
import {TEAM_CREATE} from 'src/utils/constants'
import { ThemesService } from 'src/app/services/index/themes.service';
import { MatDialog } from '@angular/material/dialog';
import { RegisterDialogComponent } from 'src/app/components/register-dialog/register-dialog.component';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json'
  }),
};

@Component({
  selector: 'app-create-team',
  templateUrl: './create-team.component.html',
  styleUrls: ['./create-team.component.scss']
})
export class CreateTeamComponent implements OnInit {
  errors:  Array<String> = [];

  currentTheme: string = this.themesService.getCurrentTheme();

  constructor(
    public dialogRef: MatDialogRef<CreateTeamComponent>, 
    private http: HttpClient,
    private userService: UserService, 
    private themesService:ThemesService,
    public dialog: MatDialog) { }

  ngOnInit() {
  }

  hide: boolean = true;

  newTeam: string = '';
  owner: string = this.userService.getCurrentUsername();
  teamBio: string = ''
  amountUsers: number = 1;
  selected = 'public';
  password: string = '';
  passwordValid: boolean = true;


  checkNameValidity(): boolean {
    if(this.newTeam.trim() == ""){
      return false;
    }else{
      return true;
    }
  }

  checkAmountValidity() {
    if(this.amountUsers < 1){
      this.amountUsers = 1;
    }
    if(this.amountUsers > 10){
      this.amountUsers = 10;
    }
  }

  checkPasswordValidity() {
    if(this.selected == 'protected'){
      if(this.password.trim() != ''){
        this.validatePassword();
      }else{
        this.passwordValid = false;
      }
    }else{
      this.passwordValid = true;
      this.password = '';
    }
  }

  updatePasswordCheck(){
    this.passwordValid = true;
  }


  cancelCreation(): void {
    this.dialogRef.close('');
  }

  confirmCreation(): void {
    this.checkPasswordValidity();

    if(this.passwordValid){
      let users: Array<string> = [];
      users.push(this.userService.getCurrentUsername());
      
      if(this.teamBio == '') {
        this.teamBio = ' ';
      }

      this.http.post<any>(TEAM_CREATE, {owner: this.userService.getCurrentUsername(), name: this.newTeam.trim(),  password: this.password.trim(), users: users, maxUsers: this.amountUsers, bio: this.teamBio}, httpOptions).subscribe((data: any) => {
        this.dialogRef.close('Created');
      });
    }
  }


  ButtonsPlacement(): string {
    if(this.selected === 'public'){
      return '17%';
    }else{
      return '0%'
    }
  }

  handlePasswordValidity(event: KeyboardEvent) {
    let regex = new RegExp("^[a-zA-ZÀ-ÿ0-9]+$");
    let key = String.fromCharCode(!event.charCode ? event.which : event.charCode);
    if (!regex.test(key)) {
      event.preventDefault();
    }else{
     this.updatePasswordCheck();
    }
  }


  validatePassword(){
    this.errors = [];

    let regex = new Array();
    regex.push("[A-Z]"); //Uppercase Alphabet.
    regex.push("[a-z]"); //Lowercase Alphabet.
    regex.push("[0-9]"); //Digit.
 
    let passed = 0;
 
    //Validate for each Regular Expression.
    for (let i = 0; i < regex.length; i++) {
        if (new RegExp(regex[i]).test(this.password)) {
            passed++;
        }
    }

    if(this.password.length == 0){
      this.errors.push("Votre mot de passe est vide.")
    }
    else if(passed < 3){
      this.errors.push("Votre mot de passe ne respecte pas les exigences requises. Veuillez vous fier à l'aide (?)")
    }

    if (this.password.length > 0 && this.password.length < 8) {
      this.errors.push("Votre mot de passe n'est pas d'une longeur minimale de 8 caratères.")
    }


    if(this.errors.length != 0){
      this.passwordValid = false;
      this.openErrorsDialog();
    }else{
      this.passwordValid = true;
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
