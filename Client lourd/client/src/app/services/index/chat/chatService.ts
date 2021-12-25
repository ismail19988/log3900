import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  private containerSize: string = '';
  private chatIsWindow: boolean = false;

  constructor() { }

  increaseChatWindow() {
    this.containerSize = '95vw';
  }
  decreaseChatWindow() {
    this.containerSize = '40vw';
  }

  getChatWindowSize() {
    return this.containerSize;
  }

  anchorChat() {
    this.chatIsWindow = false;
    this.decreaseChatWindow();
  }

  windowChat() {
    this.chatIsWindow = true;
    this.increaseChatWindow();
  }

  getChatType() {
    return this.chatIsWindow;
  }
}
  