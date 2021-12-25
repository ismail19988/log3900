import { Component, OnInit } from '@angular/core';
import { ThemesService } from 'src/app/services/index/themes.service';
import { MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'app-themes',
  templateUrl: './themes.component.html',
  styleUrls: ['./themes.component.scss']
})
export class ThemesComponent implements OnInit {

  constructor(private themesService: ThemesService, public dialogRef: MatDialogRef<ThemesComponent>) { }

  ngOnInit(): void {
  }

  updateTheme(NewTheme:string){
    this.themesService.setCurrentTheme(NewTheme);
    this.closeWindow();
  }

  closeWindow(): void {
    this.dialogRef.close();
  }
}
