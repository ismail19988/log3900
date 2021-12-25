import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef} from '@angular/material/dialog';
import { MAT_DIALOG_DATA} from '@angular/material/dialog';
import { ThemesService } from 'src/app/services/index/themes.service';

export interface DialogData {
  usernameHelper: boolean;
  passwordHelper: boolean;
  errorList: Array<string>;
  isRegister: boolean
}

@Component({
  selector: 'app-register-dialog',
  templateUrl: './register-dialog.component.html',
  styleUrls: ['./register-dialog.component.scss']
})
export class RegisterDialogComponent implements OnInit {
  displayErrorDialog: boolean = false;

  currentColor: string = this.themesService.getCurrentTheme();

  constructor(public dialogRef: MatDialogRef<RegisterDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: DialogData, private themesService:ThemesService) {
    if(data.errorList.length > 0) {
      this.displayErrorDialog = true
    }
    console.log(this.displayErrorDialog)
  }

  ngOnInit() {
  }
  closeWindow(): void {
    this.dialogRef.close();
  }

}
