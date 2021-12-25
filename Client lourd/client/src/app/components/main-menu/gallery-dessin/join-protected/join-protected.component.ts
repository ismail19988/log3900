import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MAT_DIALOG_DATA} from '@angular/material/dialog';
import { ThemesService } from 'src/app/services/index/themes.service';

export interface DialogData {
  expectedPassword: string;
}

@Component({
  selector: 'app-join-protected',
  templateUrl: './join-protected.component.html',
  styleUrls: ['./join-protected.component.scss']
})
export class JoinProtectedComponent implements OnInit {

  hide: boolean = true;

  password: string = '';
  passwordValidity: boolean = true;

  currentTheme: string = this.themesService.getCurrentTheme();

  constructor(public dialogRef: MatDialogRef<JoinProtectedComponent>, @Inject(MAT_DIALOG_DATA) public data: DialogData, private themesService:ThemesService) { }

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
      this.joinDrawing();
    }else{
      this.passwordValidity = false;
    }

  }

  cancelJoin(): void {
    this.dialogRef.close('');
  }

  joinDrawing(): void {
    this.dialogRef.close('Accepted');
  }

}
