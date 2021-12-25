import { Component, OnInit } from '@angular/core';
import { ThemesService } from 'src/app/services/index/themes.service';

@Component({
  selector: 'app-user-profile-settings',
  templateUrl: './user-profile-settings.component.html',
  styleUrls: ['./user-profile-settings.component.scss']
})
export class UserProfileSettingsComponent implements OnInit {
  userProfile: boolean = false;
  statisticsProfile: boolean = false;
  historyProfile: boolean = false;

  currentColor: string = this.themesService.getCurrentTheme();

  constructor(private themesService:ThemesService) { }

  ngOnInit(): void {
  }

}
