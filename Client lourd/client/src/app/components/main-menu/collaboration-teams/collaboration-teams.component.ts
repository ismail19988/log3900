import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SocketService } from '../../../services/index/helperServices/socket.service';
import { ChatService } from 'src/app/services/index/chat/chatService';
import { UserService } from 'src/app/services/index/user/user.service';
import { GET_ALL_TEAMS, JOIN_TEAM, LEAVE_TEAM, DELETE_TEAM } from 'src/utils/constants';
import { HttpClient } from '@angular/common/http';
import { Title } from 'src/app/model/Iresponse';
import { ITeam } from 'src/app/interfaces/drawing/team';
import { MatDialog } from '@angular/material/dialog';
import { trigger, style, animate, transition } from '@angular/animations';
import { CreateTeamComponent } from './create-team/create-team.component';
import { JoinProtectedTeamComponent } from './join-protected-team/join-protected-team.component';
import { ThemesService } from 'src/app/services/index/themes.service';


@Component({
  selector: 'app-collaboration-teams',
  templateUrl: './collaboration-teams.component.html',
  styleUrls: ['./collaboration-teams.component.scss'],
  animations: [
    trigger(
      'inOutAnimation',
      [
        transition(
          ':enter',
          [
            style({ opacity: 0.1, transform: 'translateY(-5px)' }),
            animate('0.75s',
              style({ opacity: 1, transform: 'translateY(0px)' }))
          ]
        ),
        transition(
          ':leave',
          [
            style({ opacity: 1, transform: 'translateY(0px)' }),
            animate('0.25s',
              style({ opacity: 0.2, transform: 'translateY(-5px)' }))
          ]
        )
      ]
    )
  ]
})
export class CollaborationTeamsComponent implements OnInit {
  gallery: boolean = false;
  teams: boolean = true;
  profile: boolean = false;
  labelPosition: 'before' | 'after' = 'after';
  filterProtected: boolean = false;
  showScrollDown: String = "";
  previousTeam: String = "";

  userList: {name: string, status: string} [] = [];

  chatIsWindow: boolean = this.chatService.getChatType();
  currentColor: string = this.themesService.getCurrentTheme();

  myTeams : Array<ITeam> = []
  availableTeams : Array<ITeam> = []



  constructor(
    private router: Router,
    private socketService: SocketService,
    private chatService: ChatService,
    private userService: UserService,
    private http: HttpClient,
    public dialog: MatDialog,
    private themesService:ThemesService

  ) { }

  ngOnInit(): void {
    this.getTeams();

    this.socketService.getSocket().on('join_team', (params: any) => {
      console.log(params)
      this.myTeams.forEach((team: ITeam) => {
        if(team.name === params.team){
          team.users.push({user: params.user, status: params.status})
        }
      });

      this.availableTeams.forEach((team: ITeam) => {
        if(team.name === params.team){
          team.users.push({user: params.user, status: params.status})
        }
      });
    });

    this.socketService.getSocket().on('leave_team', (params: any) => {
      console.log(params);
      this.myTeams.forEach((team: ITeam) => {
        if(team.name === params.team){
          let index = -1;
          team.users.forEach((user: any) => {
            if(user.user === params.user) {
              index = team.users.indexOf(user);
            }
          });
          if (index !== -1) {
            team.users.splice(index, 1);
          }
        }
      });

      this.availableTeams.forEach((team: ITeam) => {
        if(team.name === params.team){
          let index = -1;
          team.users.forEach((user: any) => {
            if(user.user === params.user) {
              index = team.users.indexOf(user);
            }
          });
          if (index !== -1) {
            team.users.splice(index, 1);
          }
        }
      });
   });
  }

  getTeams(): void {
    this.myTeams = [];
    this.availableTeams = [];

    this.http.post(GET_ALL_TEAMS, { }).subscribe((res: any) => {
      res.teams.forEach((team: ITeam) => {
        let isMyTeam = false;
        team.users.forEach((user: any) => {
          if(user.user === this.userService.getCurrentUsername()){
            isMyTeam = true;
          }
        });
        if(isMyTeam){
          this.myTeams.push(team);
        }else{
          this.availableTeams.push(team);
        }
      });
    })
  }

  attemptJoinTeam(team: ITeam): void{
    if(team.password !== ''){
      this.openJoinProtectedDialog(team);
    }else{
      this.joinTeam(team);
    }
  }

  joinTeam(team: ITeam): void {
    this.http.post(JOIN_TEAM, {name: team.name, user: this.userService.getCurrentUsername()}).subscribe((res: any) => {
      if(res.title == Title.AUTHORIZED) {
        this.myTeams.push(team);

        let index = -1;
        this.availableTeams.forEach((availableTeam) => {
          if (availableTeam.name === team.name) {
            index = this.availableTeams.indexOf(availableTeam);
          }
        });
        if (index !== -1) {
          this.availableTeams.splice(index, 1);
        }
      }
   })
  }

  filterOutProtected(): void {
    if(this.filterProtected){
      let filteredMyTeams: Array<ITeam> = []
      let filteredAvailableTeams: Array<ITeam> = []

      this.myTeams.forEach((myTeam) => {
        if (myTeam.password === '') {
          filteredMyTeams.push(myTeam);
        }
      });

      this.availableTeams.forEach((availableTeam) => {
        if (availableTeam.password === '') {
          filteredAvailableTeams.push(availableTeam);
        }
      });

      this.myTeams = filteredMyTeams;
      this.availableTeams = filteredAvailableTeams;
    }else{
      this.getTeams();
    }
  }


  openScrollDown(team: ITeam): void {
    if (this.previousTeam == team.name && this.showScrollDown != "") {
      this.showScrollDown = "";
    } else {
      this.previousTeam = team.name;
      this.showScrollDown = team.name;

      this.userList = [];
      team.users.forEach((user: any) => {
        this.userList.push({name: user.user, status: user.status})
      });

      this.userList.sort(function(first, second) {
        if(first.status == 'connected' || (first.status == 'busy' && second.status == 'disconnected')){
          return -1;
        }
        if(first.status == second.status){
          return 0;
        }
        if(second.status == 'connected' || (second.status == 'busy' && first.status == 'disconnected')){
          return 1;
        }
        return 0;
      });

    }
  }

  closeTeam(team: ITeam): void {
    this.http.post(DELETE_TEAM, {name: team.name}).subscribe((res: any) => {
      if(res.title == Title.AUTHORIZED) {
        this.getTeams();
      }
    })
  }

  leaveTeam(team: ITeam): void {
    this.http.post(LEAVE_TEAM, {name: team.name, user: this.userService.getCurrentUsername()}).subscribe((res: any) => {
      if(res.title == Title.AUTHORIZED) {
        this.getTeams();
      }
    })
  }

  logout(): void {
    this.socketService.disconnectSocket();
    this.router.navigate(['/']);
  }


  openCreateTeamDialog(): void {
    let dialogRef = this.dialog.open(CreateTeamComponent, {
        width: '30%',
        height: '70%',
        data: {},
        panelClass: this.themesService.getThemesModalColor()
      })
      dialogRef.afterClosed().subscribe(result => {
        console.log(result)
        if(result === 'Created'){
          this.getTeams();
        }
      });
  }

  openJoinProtectedDialog(team: ITeam): void {
    let dialogRef = this.dialog
      .open(JoinProtectedTeamComponent, {
        width: '35%',
        height: '27%',
        data: {expectedPassword: team.password},
        panelClass: this.themesService.getThemesModalColor()
      })
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'Accepted') {
        this.joinTeam(team);
      }
    });
  }

}
