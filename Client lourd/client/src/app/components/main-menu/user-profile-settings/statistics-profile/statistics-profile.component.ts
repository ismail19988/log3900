import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GET_USER_DATA } from 'src/utils/constants';
import { UserService } from 'src/app/services/index/user/user.service';
import { ThemesService } from 'src/app/services/index/themes.service';



@Component({
  selector: 'app-statistics-profile',
  templateUrl: './statistics-profile.component.html',
  styleUrls: ['./statistics-profile.component.scss']
})
export class StatisticsProfileComponent implements OnInit {
  goBack: boolean = false;

  drawingsCollaborated: number = 0;
  drawingsCreated: number = 0;
  amountTeams: number = 0;
  averageCollaboration: string = '';
  totalCollaboration: string = '';

  currentColor: string = this.themesService.getCurrentTheme();

  constructor( private http: HttpClient, private userService: UserService, private themesService:ThemesService) { }

  ngOnInit(): void {
    this.getUserStats();
  }

  getUserStats() {
    this.http.post(GET_USER_DATA, { user: this.userService.getCurrentUsername()}).subscribe((res: any) => {
      console.log(res)
      this.drawingsCollaborated = res.user.nb_collaborations
      this.drawingsCreated = res.user.nb_ownership
      this.amountTeams = res.user.nb_teams

      this.averageCollaboration = this.getTime(res.user.average_collab_time);
      this.totalCollaboration = this.getTime(res.user.totalTimeCollab);
   })
  }

  getTime(timestamp: number): string {
    let seconds = Math.floor((timestamp/1000)%60)
    let minutes = Math.floor((timestamp/(1000*60))%60)
    let hours = Math.floor((timestamp/(1000*60*60))%24)

    let hoursString = (hours < 10) ? '0' + String(hours) : String(hours)
    let minutesString = (minutes < 10) ? '0' + String(minutes) : String(minutes)
    let secondsString = (seconds < 10) ? '0' + String(seconds) : String(seconds)

    let formattedTime = hoursString + ':' + minutesString + ':' + secondsString

    return formattedTime

  }

  returnToProfileMenu(){
    this.goBack = true;
  }

}
