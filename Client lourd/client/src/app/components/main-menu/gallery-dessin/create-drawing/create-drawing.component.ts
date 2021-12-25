import { Privacy } from '../../../../Enum/privacy';
import { Component, OnInit} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { UserService } from 'src/app/services/index/user/user.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatDialogRef } from '@angular/material/dialog';
import { ITeam } from 'src/app/interfaces/drawing/team';
import {CREATE_DRAWING, GET_ALL_TEAMS} from 'src/utils/constants'
import { ThemesService } from 'src/app/services/index/themes.service';
import { RegisterDialogComponent } from 'src/app/components/register-dialog/register-dialog.component';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json'
  }),
};

@Component({
  selector: 'app-create-drawing',
  templateUrl: './create-drawing.component.html',
  styleUrls: ['./create-drawing.component.scss']
})
export class CreateDrawingComponent implements OnInit {
  hide: boolean = true;

  newDrawing: string = '';
  owner: string = this.userService.getCurrentUsername();
  possibleOwners : Array<String> = [];
  selected = 'public';
  password: string = '';
  passwordValid: boolean = true;
  errors:  Array<String> = [];

  soleOwner: boolean = true;

  currentTheme: string = this.themesService.getCurrentTheme();

  constructor(
    public dialogRef: MatDialogRef<CreateDrawingComponent>,  
    private http: HttpClient,
    private userService: UserService, 
    private themesService:ThemesService,
    public dialog: MatDialog) { }

  ngOnInit() {
    this.getPossibleOwners();
  }

  getPossibleOwners(): void {
    this.http.post(GET_ALL_TEAMS, { }).subscribe((res: any) => {
      this.possibleOwners = [];
      this.possibleOwners.push(this.userService.getCurrentUsername());

      res.teams.forEach((team: ITeam) => {
        let isMyTeam = false;
        team.users.forEach((user: any) => {
          if(user.user === this.userService.getCurrentUsername()){
            isMyTeam = true;
          }
        });
        if(isMyTeam ){
          this.possibleOwners.push(team.name);
        }
      });

      if(this.possibleOwners.length > 1){
        this.soleOwner = false;
      }
    })
  }


  checkNameValidity(): boolean {
    if(this.newDrawing.trim() == ""){
      return false;
    }else{
      return true;
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
    let drawingPrivacy: Privacy;

    switch(this.selected) {
      case 'public':
        drawingPrivacy = Privacy.public
        break; 
      case 'protected':
        drawingPrivacy = Privacy.protected
        break;
      case 'private':
        drawingPrivacy = Privacy.private
        break;
      default:
        drawingPrivacy = Privacy.public
    }

    this.checkPasswordValidity();
  
    if(this.passwordValid){
      this.http.post<any>(CREATE_DRAWING, {owner: this.userService.getCurrentUsername(), drawing: this.newDrawing.trim(), privacy: drawingPrivacy, password: this.password.trim(), ...(this.owner != this.userService.getCurrentUsername() && {team: this.owner})}, httpOptions).subscribe((data: any) => {
        this.dialogRef.close(this.newDrawing.trim());
      });
    }
  }


  ButtonsPlacement(): string {
    if(this.selected === 'public' || this.selected === 'private'){
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
