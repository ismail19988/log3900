import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { GET_USER_DATA, GET_DRAWING_DATA, JOIN_DRAWING } from 'src/utils/constants';
import { UserService } from 'src/app/services/index/user/user.service';
import { IAction } from 'src/app/interfaces/action';
import { DrawingSvgService } from 'src/app/services/index/drawing/drawing-svg.service';
import { SocketService } from './../../../../services/index/helperServices/socket.service';
import { Title } from 'src/app/model/Iresponse';
import { Privacy } from './../../../../Enum/privacy';
import { PencilService } from 'src/app/services/index/drawing/pencil.service';
import { EllipseService } from 'src/app/services/index/drawing/ellipse.service';
import { RectangleService } from 'src/app/services/index/drawing/rectangle.service';
import { EraserService } from 'src/app/services/index/drawing/eraser.service';
import { SelectionService } from 'src/app/services/index/drawing/selection.service';
import { JoinProtectedComponent } from '../../gallery-dessin/join-protected/join-protected.component';
import { ThemesService } from 'src/app/services/index/themes.service';


@Component({
  selector: 'app-history-profile',
  templateUrl: './history-profile.component.html',
  styleUrls: ['./history-profile.component.scss']
})
export class HistoryProfileComponent implements OnInit {
  goBack: boolean = false; 
  myHistories: {type: string, drawing: string | null, date: {day: string, month: string, year: string}, time: string} [] = [];

  currentColor: string = this.themesService.getCurrentTheme();

  constructor(
    public dialog: MatDialog,
    private http: HttpClient, 
    private userService: UserService, 
    private drawingHelper: DrawingSvgService,
    private socketService: SocketService, 
    private router: Router,
    private selection: SelectionService,
    private ellipse: EllipseService,
    private pencil: PencilService,
    private rectangle: RectangleService,
    private eraser:EraserService,
    private themesService:ThemesService
     ) { }

  ngOnInit(): void {
    this.getUserStats();
  }

  getUserStats() {
    this.http.post(GET_USER_DATA, { user: this.userService.getCurrentUsername()}).subscribe((res: any) => {
      res.user.lastAction.forEach((action : IAction) => {
        let date = new Date(action.timestamp);
        let time =  ('0' + date.getHours()).slice(-2) + ':' + ('0' +  date.getMinutes()).slice(-2) + ':' + ('0' +  date.getSeconds()).slice(-2) ;
        this.myHistories.push({type: action.action, drawing: action.drawing, date: {day: date.getDate().toString(), month: (date.getMonth() + 1).toString(), year: date.getFullYear().toString()}, time: time})
      });
      this.filterHistory();
    })
  }

  getDrawingInfo(drawingName: string) {
    this.http.post(GET_DRAWING_DATA, { drawing: drawingName}).subscribe((res: any) => {
      console.log(res.drawing);
      if((Object.keys(Privacy).indexOf(String(res.drawing.privacy))) === 1){
        this.openJoinProtectedDialog(res.drawing.name, res.drawing.password);
      } else {
        this.goToWorkspace(res.drawing.name);
      }
    })
  }

  filterHistory(): void {
    this.myHistories.sort((x, y) => +new Date(x.date.year + '/' + x.date.month + '/' + x.date.day + ', ' + x.time) - 
                                    +new Date(y.date.year + '/' + y.date.month + '/' + y.date.day + ', ' + y.time));
    this.myHistories.reverse();

    let filteredHistory: {type: string, drawing: string | null, date: {day: string, month: string, year: string}, time: string} [] = [];
    
    this.myHistories.forEach((history) => {
      if(history.type == 'login' || history.type=='logout' || history.type=='join_drawing'){
        filteredHistory.push(history);
      }
    });

    this.myHistories = filteredHistory;
  }

  returnToProfileMenu(): void {
    this.goBack = true;
  }


  goToWorkspace(drawing: string) {
    this.drawingHelper.choosedDrawing = drawing;

    this.http.post(JOIN_DRAWING, { user: this.userService.getCurrentUsername(), drawing: drawing }).subscribe((res: any) => {
       if(res.title == Title.AUTHORIZED) {
         console.log(res)
         this.drawingHelper.serverElements = res.objects;
         this.drawingHelper.drawing_version = res.version;
         this.drawingHelper.drawing_versions = res.versions;
        setTimeout(() => {
          if(!this.socketService.toolsInited) {
            this.initTools();
          }
          this.router.navigate(['/workspace']);
        }, 100)
      }
    })
  }

  private initTools() {
    this.pencil.initPencil(this.socketService.getSocket());
    this.rectangle.initRectangle(this.socketService.getSocket());
    this.ellipse.initEllipse(this.socketService.getSocket());
    this.eraser.initEfface(this.socketService.getSocket());
    this.selection.initSelection(this.socketService.getSocket());
    this.socketService.toolsInited = true;
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
