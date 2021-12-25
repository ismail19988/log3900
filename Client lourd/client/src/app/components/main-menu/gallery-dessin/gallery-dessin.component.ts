import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SocketService } from '../../../services/index/helperServices/socket.service';
import { ChatService } from 'src/app/services/index/chat/chatService';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { GET_ALL_DRAWINGS, GET_ALL_TEAMS, JOIN_DRAWING } from 'src/utils/constants';
import { IDrawing } from 'src/app/interfaces/drawing/drawing';
import { DrawingSvgService } from 'src/app/services/index/drawing/drawing-svg.service';
import { CreateDrawingComponent } from './create-drawing/create-drawing.component';
import { MatDialog } from '@angular/material/dialog';
import { UserService } from 'src/app/services/index/user/user.service';
import { avatarService } from 'src/app/services/index/user/avatar.service';
import { DateHandlerService } from 'src/app/services/index/helperServices/dateHandler';
import { Title } from 'src/app/model/Iresponse';
import { Privacy } from '../../../Enum/privacy';
import { trigger, style, animate, transition } from '@angular/animations';
import { JoinProtectedComponent } from './join-protected/join-protected.component';
import { ThemesComponent } from '../../themes/themes.component';
import { PencilService } from 'src/app/services/index/drawing/pencil.service';
import { EllipseService } from 'src/app/services/index/drawing/ellipse.service';
import { RectangleService } from 'src/app/services/index/drawing/rectangle.service';
import { EraserService } from 'src/app/services/index/drawing/eraser.service';
import { SelectionService } from 'src/app/services/index/drawing/selection.service';
import { ThemesService } from 'src/app/services/index/themes.service';
import { RegisterDialogComponent } from 'src/app/components/register-dialog/register-dialog.component';
import { ITeam } from 'src/app/interfaces/drawing/team';

@Component({
  selector: 'app-gallery-dessin',
  templateUrl: './gallery-dessin.component.html',
  styleUrls: ['./gallery-dessin.component.scss'],
  animations: [
    trigger(
      'inOutAnimation',
      [
        transition(
          ':enter',
          [
            style({ opacity: 0, transform: 'translatex(-40px)' }),
            animate('0.6s',
              style({ opacity: 1, transform: 'translatex(0px)' }))
          ]
        ),
        transition(
          ':leave',
          [
            style({ opacity: 1, transform: 'translateX(0px)' }),
            animate('0s',
              style({ opacity: 0, transform: 'translateX(-2px)' }))
          ]
        )
      ]
    )
  ]
})
export class GalleryDessinComponent implements OnInit {
  gallery: boolean = true;
  teams: boolean = false;
  profile: boolean = false;

  hover: boolean = false;

  errorMessage: string = '';

  allDrawings: Array<IDrawing> = [];
  drawings: Array<IDrawing> = [];
  myTeams: Array<ITeam> = [];

  chatIsWindow: boolean = this.chatService.getChatType();
  userAvatar: string = this.avatarService.getPreviewAvatar();

  filterSearch: string = '';

  constructor(
    private router: Router,
    private socketService: SocketService,
    private chatService: ChatService,
    private http: HttpClient,
    private drawingHelper: DrawingSvgService,
    public dialog: MatDialog,
    private userService: UserService,
    private avatarService: avatarService,
    private dateHandler: DateHandlerService,
    private selection: SelectionService,
    private ellipse: EllipseService,
    private pencil: PencilService,
    private rectangle: RectangleService,
    private eraser:EraserService,
    private themesService:ThemesService
  ) { }

  ngOnInit(): void {
    this.updateGallery();
    this.getTeams();
    this.socketService.getSocket().on('new_drawing', () => {
      this.updateGallery();
      this.getTeams();
    })
  }

  updateGallery(): void {
    this.http.get(GET_ALL_DRAWINGS).subscribe((res: any) => {
      this.allDrawings = []
      this.drawings = []
      res.drawings.forEach((drw: IDrawing) => {
        if(this.filterDrawingPrivacy(drw)){
          this.allDrawings.push(drw);
          this.drawings.push(drw);
        }
      });
    })
  }

  getTeams(): void {
    this.myTeams = [];

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
        }
      });
    })
  }

  updateFocused(): void {
    if(this.gallery) {
      if((<HTMLElement>document.getElementById('galerie')).classList.contains('button-active')) {
        (<HTMLElement>document.getElementById('equipes')).classList.remove('button-active');
        (<HTMLElement>document.getElementById('profil')).classList.remove('button-active');
      } else {
        (<HTMLElement>document.getElementById('galerie')).classList.add('button-active');
        (<HTMLElement>document.getElementById('equipes')).classList.remove('button-active');
        (<HTMLElement>document.getElementById('profil')).classList.remove('button-active');
      }
    } else if(this.teams) {
      (<HTMLElement>document.getElementById('galerie')).classList.remove('button-active');
      (<HTMLElement>document.getElementById('equipes')).classList.add('button-active');
      (<HTMLElement>document.getElementById('profil')).classList.remove('button-active');
    } else if(this.profile) {
      (<HTMLElement>document.getElementById('galerie')).classList.remove('button-active');
      (<HTMLElement>document.getElementById('equipes')).classList.remove('button-active');
      (<HTMLElement>document.getElementById('profil')).classList.add('button-active');
    } else {
      return;
    }
  }

  filterGalleryPrivacyIcon(drawing: IDrawing): number{
    if((Object.keys(Privacy).indexOf(String(drawing.privacy)) - 3) === 0){
      return 0;
    }else if((Object.keys(Privacy).indexOf(String(drawing.privacy)) - 3) === 1){
      return 1;
    }
    return 2
  }


  filterDrawingPrivacy(drawing: IDrawing): boolean {
    if((Object.keys(Privacy).indexOf(String(drawing.privacy)) - 3) === 0 || (Object.keys(Privacy).indexOf(String(drawing.privacy)) - 3) === 1){
      return true;
    }else if((Object.keys(Privacy).indexOf(String(drawing.privacy)) - 3) === 2 && drawing.owner == this.userService.getCurrentUsername()){
      return true;
    }else if(drawing.team != undefined){
      let answer = false;
      this.myTeams.forEach((team: ITeam) => {
        if(team.name == drawing.team){
          team.users.forEach((user: any) => {
            if(user.user.trim() === this.userService.getCurrentUsername().trim()){
              answer =  true;
            }
          });
        }
      });
      return answer;
    }
    return false;
  }

  attemptDrawingJoin(drawing: IDrawing) {

    let drawingName = drawing.name;
    let drawingPrivacy = drawing.privacy;
    let drawingPassword = drawing.password;

    if((Object.keys(Privacy).indexOf(String(drawingPrivacy)) - 3) === 1){
      this.openJoinProtectedDialog(drawingName, drawingPassword);
    } else {
      this.goToWorkspace(drawingName);
    }
  }


  goToWorkspace(drawing: string) {

    this.drawingHelper.choosedDrawing = drawing;

    this.http.post(JOIN_DRAWING, { user: this.userService.getCurrentUsername(), drawing: drawing }).subscribe((res: any) => {
       if(res.title == Title.AUTHORIZED) {
         console.log(res)
         this.drawingHelper.serverElements = res.objects;
         this.drawingHelper.drawing_version = res.version;
         this.drawingHelper.drawing_versions = res.versions;
         console.log(this.drawingHelper.drawing_versions);
        setTimeout(() => {
          if(!this.socketService.toolsInited) {
            this.initTools();
          }
          this.chatService.anchorChat();
          this.router.navigate(['/workspace']);
        }, 100)
      }
    },
    (connectFailure: HttpErrorResponse) => {
      this.errorMessage = connectFailure.error.message;
      this.openDrawingFullDialog();
    });
  }

  private initTools() {
    this.pencil.initPencil(this.socketService.getSocket());
    this.rectangle.initRectangle(this.socketService.getSocket());
    this.ellipse.initEllipse(this.socketService.getSocket());
    this.eraser.initEfface(this.socketService.getSocket());
    this.selection.initSelection(this.socketService.getSocket());
    this.socketService.toolsInited = true;
  }

  getRealDate(unixDate: number){
    let date = new Date(unixDate * 1000).toDateString();
    let dateArray = date.split(' ');
    dateArray = this.dateHandler.convertMonthToFrench(dateArray);
    dateArray = this.dateHandler.convertDayToFrench(dateArray);

    let day = dateArray[2];
    dateArray[2] = dateArray[1];
    dateArray[1] = day

    date = dateArray.toString().replace(/,/g, ' ');
    return date;
  }

  logout(): void {
    this.socketService.disconnectSocket();
    this.router.navigate(['/']);
  }


  updateAvailableDrawings(event: KeyboardEvent) {
    if (event.key == "Backspace") {
      this.drawings = this.allDrawings;
    }
    this.filterDrawings();
  }

  filterDrawings() {
    let newList:Array<IDrawing> = [];
    for(let drawing of this.allDrawings) {

      //filter by drawing name
      if(drawing.name.toLowerCase().includes(this.filterSearch.toLowerCase())){
        newList.push(drawing);
      }
      //filter by username
      else if(drawing.owner.toLowerCase().includes(this.filterSearch.toLowerCase())){
        newList.push(drawing);
      }
      //filter by date
      else if(this.filterDrawingDate(drawing)){
        newList.push(drawing);
      }
      //filter by email
      else if(drawing.email != ' ' && drawing.email.toLowerCase().includes(this.filterSearch.toLowerCase())){
        newList.push(drawing);
      }
      //filter by firstname
      else if(drawing.firstname != ' ' && drawing.firstname.toLowerCase().includes(this.filterSearch.toLowerCase())){
        newList.push(drawing);
      }
      //filter by lastname
      else if(drawing.lastname != ' ' && drawing.lastname.toLowerCase().includes(this.filterSearch.toLowerCase())){
        newList.push(drawing);
      }
    }
    this.drawings = newList;
  }

  filterDrawingDate(drawing: IDrawing) : boolean {
    let date  = this.getRealDate(drawing.creationTimestamp).split(' ');

     //filter by date day
    if(this.dateHandler.getDayFullString(date[0]).toLowerCase().includes(this.filterSearch.toLowerCase())){
      return true;
    }
    //filter by date month
    else if(this.dateHandler.getMonthFullString(date[2]).toLowerCase().includes(this.filterSearch.toLowerCase())){
      return true;
    }
    //filter by date day(number)
    else if(date[1].toLowerCase().includes(this.filterSearch.toLowerCase())){
      return true;
    }
    //filter by date year
    else if(date[3].toLowerCase().includes(this.filterSearch.toLowerCase())){
      return true;
    }
    return false;
  }

  openThemes(): void {

    this.dialog.open(ThemesComponent, {
      width: '30%',
      height: '25%',
      data: {},
      panelClass: this.themesService.getThemesModalColor()
    })
  }


  openCreateDrawingDialog(): void {
    this.dialog.open(CreateDrawingComponent, {
        width: '30%',
        height: '50%',
        data: {},
        panelClass: this.themesService.getThemesModalColor()
      })
  }

  openDrawingFullDialog(): void {
    this.dialog
        .open(RegisterDialogComponent, {
            width: '500px',
            data: {usernameHelper: false, passwordHelper: false, errorList: [this.errorMessage], isRegister: false},
            panelClass: this.themesService.getThemesModalColor()
        })
  }

  openJoinProtectedDialog(drawingName: string, password: string): void {
    let dialogRef = this.dialog
      .open(JoinProtectedComponent, {
        width: '35%',
        height: '27%',
        data: {expectedPassword: password},
        panelClass: this.themesService.getThemesModalColor()
      })
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'Accepted') {
        this.goToWorkspace(drawingName);
      }
    });
  }
}
