import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MAT_DIALOG_DATA} from '@angular/material/dialog';

export interface DialogData {
  expectedPassword: string;
}

@Component({
  selector: 'app-join-protected-team',
  templateUrl: './join-protected-team.component.html',
  styleUrls: ['./join-protected-team.component.scss']
})
export class JoinProtectedTeamComponent implements OnInit {

  hide: boolean = true;

  password: string = '';
  passwordValidity: boolean = true;

  constructor(public dialogRef: MatDialogRef<JoinProtectedTeamComponent>, @Inject(MAT_DIALOG_DATA) public data: DialogData) { }

  ngOnInit(): void {
  }

  handleKeypress(event: KeyboardEvent) {
    if (event.key == "Enter") {
      this.validatePassword();
    }else{
      let regex = new RegExp("^[a-zA-ZÀ-ÿ0-9]+$");
      let key = String.fromCharCode(!event.charCode ? event.which : event.charCode);
      if (!regex.test(key)) {
        event.preventDefault();
      }else{
        this.passwordValidity = true;
      }
    }
  }

  validatePassword() {
    if(this.password === this.data.expectedPassword){
      this.joinTeam();
    }else{
      this.passwordValidity = false;
    }

  }

  cancelJoin(): void {
    this.dialogRef.close('');
  }

  joinTeam(): void {
    this.dialogRef.close('Accepted');
  }

}
