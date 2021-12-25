import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { IResponse, Status, Title } from '../../model/Iresponse';
import { UserService } from '../../services/index/user/user.service';
import { avatarService } from 'src/app/services/index/user/avatar.service';
import { SocketService } from '../../services/index/helperServices/socket.service';
import { LOGIN_URL } from 'src/utils/constants'
import { Router } from '@angular/router';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json'
  }),
};

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  hide: boolean = true;
  userConnected: boolean = false;
  emailInvalid: boolean = false;
  passwordInvalid: boolean = false;
  emailInput: string = '';
  passwordInput: string = '';

  constructor(
    private router: Router,
    private http: HttpClient,
    private userService: UserService,
    private avatarService: avatarService,
    private socketService: SocketService
  ) { }

  ngOnInit() { }

  authentificationRequest() {
    let data = { "email": this.emailInput.trim(), "password": this.passwordInput.trim() }
    this.http.post<any>(LOGIN_URL, data, httpOptions).subscribe((data: IResponse) => {
      if (data.title == Title.AUTHORIZED) {
        this.credentialsValidity();
        this.userService.setCurrentUser(data.username, data.token);
        this.avatarService.setPreviewAvatar(data.avatar)
        this.socketService.initSocket();
        this.socketService.getSocket().on('connect', ()=>{this.router.navigate(['/gallery-dessin']);})
      }
    },
      (connectFailure: HttpErrorResponse) => {
        console.log(connectFailure);
        if (connectFailure.status == Status.EMAIL_NOT_FOUND) {
          this.emailInvalid = true;
          this.animateBadLogin();
        }
        if (connectFailure.status == Status.USER_ALREADY_CONNECTED) {
          this.userConnected = true;
          this.animateBadLogin();
        }
        if (connectFailure.status == Status.WRONG_PASSWORD) {
          this.passwordInvalid = true;
          this.animateBadLogin();
        }
        if (connectFailure.status == Status.PASSWORD_NOT_PROVIDED) {
          this.passwordInvalid = true;
          this.animateBadLogin();
        }
      });

  }

  updateLoginMessages(event: KeyboardEvent) {
    if (event.key == "Enter") {
      this.handleKeypress(event);
    } else {
      this.credentialsValidity();
    }
  }

  handleKeypress(event: KeyboardEvent) {
    if (event.key == "Enter") {
      this.authentificationRequest();
    }
  }

  credentialsValidity() {
    if (this.userConnected) {
      this.userConnected = false;
    }
    if (this.emailInvalid) {
      this.emailInvalid = false;
    }
    if (this.passwordInvalid) {
      this.passwordInvalid = false;
    }
  }


  goToRegisterPage() {
    this.router.navigate(['/register']);
  }

  animateBadLogin() {
    (<HTMLElement>document.getElementById('main_card')).animate([
      { transform: 'translate3d(-2px, -2px, 0)' }, 
      { transform: 'translate3d(4px, 0, 0)' },
      { transform: 'translate3d(-8px, 2px, 0)' }, 
      { transform: 'translate3d(8px, 0, 0)' },
      { transform: 'translate3d(-4px, -2px, 0)' }, 
      { transform: 'translate3d(8px, 0, 0)' },
      { transform: 'translate3d(-16px,2px, 0)' }, 
      { transform: 'translate3d(16px, 0, 0)' },
      { transform: 'translate3d(-2px, -2px, 0)' }, 
      { transform: 'translate3d(4px, 0, 0)' },
      { transform: 'translate3d(-8px, 2px, 0)' }, 
      { transform: 'translate3d(8px, 0, 0)' },
      { transform: 'translate3d(-4px, -2px, 0)' },
    ], {
      duration: 1000
    });
  }

}
