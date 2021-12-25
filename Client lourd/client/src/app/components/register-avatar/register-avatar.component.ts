import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef} from '@angular/material/dialog';
import { MAT_DIALOG_DATA} from '@angular/material/dialog';
import { avatarService } from 'src/app/services/index/user/avatar.service';
import { ThemesService } from 'src/app/services/index/themes.service';

export interface DialogData {
  isRegister: boolean
}

@Component({
  selector: 'app-register-avatar',
  templateUrl: './register-avatar.component.html',
  styleUrls: ['./register-avatar.component.scss']
})
export class RegisterAvatarComponent implements OnInit {

  currentColor: string = this.themesService.getCurrentTheme();

  constructor(public dialogRef: MatDialogRef<RegisterAvatarComponent>, @Inject(MAT_DIALOG_DATA) public data: DialogData, private avatar: avatarService, private themesService:ThemesService) { }

  ngOnInit() {
    let image = this.avatar.getPreviewAvatar();
    (<HTMLElement>document.getElementById('image-chosen')).setAttribute('src', image);
  }
  
  closeWindow(): void {
    this.dialogRef.close('apply');
  }

  chooseAvatarFromDefaults(event: MouseEvent){
    this.avatar.defaultAvatar = true;
    let choosenAvatar = (<HTMLElement>event.target).getAttribute('src');
    this.setPreviewAvatar(String(choosenAvatar));
  }

  setPreviewAvatar(image: string){
    (<HTMLElement>document.getElementById('image-chosen')).setAttribute('src', image);
    this.avatar.setPreviewAvatar(image);
  }

  processFile(fileInput: HTMLInputElement) {
    this.avatar.defaultAvatar = false;
    if(fileInput.files && fileInput.files[0] != null) {
      let file: File = fileInput.files[0];
      var reader = new FileReader();
      var reader2nd = new FileReader();
      reader.readAsArrayBuffer(file);
      reader.onload = () => {
        var arrayBuffer = reader.result
        const typedArray = new Uint8Array(arrayBuffer as ArrayBuffer);
        const array = [...typedArray];    
        this.avatar.setAvatar(array);
      };

      reader2nd.readAsDataURL(file);
      reader2nd.onload = () => {
        this.setPreviewAvatar(String(reader2nd.result));
      };
    }
  }
}
