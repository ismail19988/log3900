// installed modules
import { ScrollingModule } from '@angular/cdk/scrolling';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule,} from '@angular/material/button';
import { MatDialogModule} from '@angular/material/dialog';
import { MatFormFieldModule} from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatCardModule } from "@angular/material/card";
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox'; 
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import {MatSliderModule} from '@angular/material/slider';
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { MatTooltipModule } from '@angular/material/tooltip';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PopoutWindowModule } from 'angular-popout-window';
import { ClickOutsideModule } from 'ng-click-outside';
import { ToastrModule } from 'ngx-toastr';
import { AppRoutingModule } from './app-routing.module';

// our used components
import { AppComponent } from './components/app/app.component';
import { ColorPaletteComponent } from './components/color/color-palette/color-palette.component';
import { ColorPickerComponent } from './components/color/color-picker/color-picker.component';
import { ColorSelectorComponent } from './components/color/color-selector/color-selector.component';
import { DrawingPictureComponent } from './components/drawing-picture/drawing-picture.component';
import { EntryPointComponent } from './components/entry-point/entry-point.component';
import { NewDrawingComponent } from './components/new-drawing/new-drawing.component';
import { WorkspaceComponent } from './components/workspace/workspace.component';
import { DrawingSvgService } from './services/index/drawing/drawing-svg.service';
import { LoginComponent } from './components/login/login.component';
import { ChatComponent } from './components/chatcomponents/chat/chat.component';
import { RegisterComponent } from './components//register/register.component';
import { RegisterDialogComponent } from './components/register-dialog/register-dialog.component';
import { RegisterAvatarComponent } from './components/register-avatar/register-avatar.component';
import { SearchRoomDialogComponent } from './components/chatcomponents/search-room-dialog/search-room-dialog.component';
import { AddRoomDialogComponent } from './components/chatcomponents/add-room-dialog/add-room-dialog.component';
import { GalleryDessinComponent } from './components/main-menu/gallery-dessin/gallery-dessin.component';
import { CreateDrawingComponent } from './components/main-menu/gallery-dessin/create-drawing/create-drawing.component';
import { JoinProtectedComponent } from './components/main-menu/gallery-dessin/join-protected/join-protected.component';
import { CollaborationTeamsComponent } from './components/main-menu/collaboration-teams/collaboration-teams.component';
import { CreateTeamComponent } from './components/main-menu/collaboration-teams/create-team/create-team.component';
import { JoinProtectedTeamComponent } from './components/main-menu/collaboration-teams/join-protected-team/join-protected-team.component';
import { UserProfileComponent } from './components/main-menu/user-profile-settings/user-profile/user-profile.component';
import { UserProfileSettingsComponent } from './components/main-menu/user-profile-settings/user-profile-settings.component';
import { StatisticsProfileComponent } from './components/main-menu/user-profile-settings/statistics-profile/statistics-profile.component';
import { HistoryProfileComponent } from './components/main-menu/user-profile-settings/history-profile/history-profile.component';
import { ChangeUsernameComponent } from './components/main-menu/user-profile-settings/user-profile/change-username/change-username.component';
import { ChangePasswordComponent } from './components/main-menu/user-profile-settings/user-profile/change-password/change-password.component';
import { ThemesComponent } from './components/themes/themes.component';

@NgModule({
    declarations: [
        AppComponent,
        WorkspaceComponent,
        NewDrawingComponent,
        EntryPointComponent,
        ColorPickerComponent,
        ColorSelectorComponent,
        ColorPaletteComponent,
        DrawingPictureComponent,
        DrawingPictureComponent,
        LoginComponent,
        ChatComponent,
        RegisterComponent,
        RegisterDialogComponent,
        RegisterAvatarComponent,
        SearchRoomDialogComponent,
        AddRoomDialogComponent,
        GalleryDessinComponent,
        CreateDrawingComponent,
        JoinProtectedComponent,
        CollaborationTeamsComponent,
        CreateTeamComponent,
        JoinProtectedTeamComponent,
        UserProfileComponent,
        UserProfileSettingsComponent,
        StatisticsProfileComponent,
        HistoryProfileComponent,
        ChangeUsernameComponent,
        ChangePasswordComponent,
        ThemesComponent
    ],
    imports: [
        BrowserModule,
        HttpClientModule,
        AppRoutingModule,
        FormsModule,
        MatDialogModule,
        MatFormFieldModule,
        MatCardModule,
        MatButtonModule,
        MatInputModule,
        MatRadioModule,
        BrowserAnimationsModule,
        ClickOutsideModule,
        MatSnackBarModule,
        MatTooltipModule,
        ScrollingModule,
        MatSidenavModule,
        MatExpansionModule,
        MatIconModule,
        MatSelectModule,
        MatCheckboxModule,
        MatSlideToggleModule,
        MatSliderModule,
        PopoutWindowModule,
        ToastrModule.forRoot(),
    ],
    providers: [DrawingSvgService],
    bootstrap: [AppComponent],
    entryComponents: [NewDrawingComponent, RegisterDialogComponent, RegisterAvatarComponent,
                      SearchRoomDialogComponent, AddRoomDialogComponent, CreateDrawingComponent, 
                      JoinProtectedComponent, CreateTeamComponent, JoinProtectedTeamComponent, 
                      ChangeUsernameComponent, ChangePasswordComponent, ThemesComponent],
})
export class AppModule {}
