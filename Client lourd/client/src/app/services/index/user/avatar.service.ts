
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class avatarService {

private avatar : Array<Number>;
private previewAvatar: string = "https://firebasestorage.googleapis.com/v0/b/log3900-102.appspot.com/o/pepe%2Fpeepolove.png?alt=media&token=e2f5c89a-5479-43ae-bf3e-7db3ab7de856";
public defaultAvatar: boolean = true;

  constructor() { }

  public setAvatar(avatar: number[]) {
      this.avatar = avatar
  }

  public getAvatar() {
    if(this.defaultAvatar) {
      return this.previewAvatar;
    }
    return this.avatar
  }

  public setPreviewAvatar(avatar: string) {
    this.previewAvatar = avatar
  }

  public getPreviewAvatar() {
    return this.previewAvatar
  }
  
}
