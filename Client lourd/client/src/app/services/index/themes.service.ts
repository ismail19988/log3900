import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemesService {
  currentTheme: string = 'blue'

  //Map pour la couleur du modale des themes
  ThemesModal: Map<String, String> = new Map();

  //Maps pour menu principale
  MenuSideNav: Map<String, String> = new Map();
  MenuContainer: Map<String, String> = new Map();
  MenuContainerContent: Map<String, String> = new Map();
  ContainerContentButtons: Map<String, String> = new Map();
  ContainerFooterButtons: Map<String, String> = new Map();
  CollabTeamScrollDown: Map<String, String> = new Map();
  textColor: Map<String, String> = new Map();
  inverseTextColor: Map<String, String> = new Map();
  shadowBox: Map<String, String> = new Map();

  messageSendButton: Map<String, String> = new Map();
  myMessageBox: Map<String, String> = new Map();
  otherMessageBox: Map<String, String> = new Map();


  constructor() {
    this.ThemesModal.set('blue', 'themes-modal-blue').set('orange', 'themes-modal-orange').set('light', 'themes-modal-light').set('dark', 'themes-modal-dark')


    this.MenuSideNav.set('blue', '#0051A1').set('orange', '#cc5200').set('light', '#A0A0A0').set('dark', '#202020')
    this.MenuContainer.set('blue', '#0051A1').set('orange', '#cc5200').set('light', '#A0A0A0').set('dark', '#202020')
    this.MenuContainerContent.set('blue', '#003F7C').set('orange', '#993d00').set('light', '#909090').set('dark', '#101010')
    this.ContainerContentButtons.set('blue', '#0266DD').set('orange', '#ff8533').set('light', '#E8E8E8').set('dark', '#505050')
    this.ContainerFooterButtons.set('blue', '#0051A1').set('orange', '#cc5200').set('light', '#DCDCDC').set('dark', '#303030')
    this.CollabTeamScrollDown.set('blue', '#0051A1').set('orange', '#cc5200').set('light', '#C0C0C0').set('dark', '#202020')
    this.textColor.set('blue', '#FFFFFF').set('orange', '#FFFFFF').set('light', '#000000').set('dark', '#FFFFFF')
    this.inverseTextColor.set('blue', '#0051A1').set('orange', '#cc5200').set('light', '#A0A0A0').set('dark', '#000000')
    this.shadowBox.set('blue', '#FFFFFF').set('orange', '#FFFFFF').set('light', '#000000').set('dark', '#FFFFFF')

    this.messageSendButton.set('blue', '#3385ff').set('orange', '#ff8533').set('light', '#ffffff').set('dark', '#505050')
    this.myMessageBox.set('blue', '#1F69FF').set('orange', '#ff8533').set('light', '#FFFFFF').set('dark', '#505050')
    this.otherMessageBox.set('blue', '#7740C9').set('orange', '#ff6666').set('light', '#909090').set('dark', '#202020')
   }

  getCurrentTheme() : string {
    return this.currentTheme;
  }

  setCurrentTheme(newTheme : string) {
    this.currentTheme = newTheme;
  }


  getThemesModalColor() {
    let key = this.getCurrentTheme();
    return String(this.ThemesModal.get(key));
  }

  

  //Menu principale getters
  getMenuSideNavColor() {
    let key = this.getCurrentTheme();
    return String(this.MenuSideNav.get(key));
  }
  getMenuContainerColor() {
    let key = this.getCurrentTheme();
    return String(this.MenuContainer.get(key));
  }
  getMenuContainerContentColor() {
    let key = this.getCurrentTheme();
    return String(this.MenuContainerContent.get(key));
  }
  getContainerContentButtonsColor() {
    let key = this.getCurrentTheme();
    return String(this.ContainerContentButtons.get(key));
  }
  getContainerFooterButtonsColor() {
    let key = this.getCurrentTheme();
    return String(this.ContainerFooterButtons.get(key));
  }
  getCollabTeamScrollDown() {
    let key = this.getCurrentTheme();
    return String(this.CollabTeamScrollDown.get(key));
  }
  getTextColor() {
    let key = this.getCurrentTheme();
    return String(this.textColor.get(key));
  }
  getInverseTextColor() {
    let key = this.getCurrentTheme();
    return String(this.inverseTextColor.get(key));
  }
  getShadowBox() {
    let key = this.getCurrentTheme();
    return String(this.textColor.get(key));
  }
  getMessageButton() {
    let key = this.getCurrentTheme();
    return String(this.messageSendButton.get(key));
  }

  getMyMessageBox() {
    let key = this.getCurrentTheme();
    return String(this.myMessageBox.get(key));
  }

  getOtherMessageBox() {
    let key = this.getCurrentTheme();
    return String(this.otherMessageBox.get(key));
  }
}
