import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DateHandlerService {
  constructor() { }

  convertMonthToFrench(date: Array<string>) : Array<string> {
    let month = date[1];
    let frenchMonth = '';

    switch(month) {
        case 'Jan':
          frenchMonth = 'Jan';
          break; 
        case 'Feb':
          frenchMonth = 'Fév';
          break;
        case 'Mar':
          frenchMonth = 'Mars';
          break;
        case 'Apr':
          frenchMonth = 'Avr';
          break; 
        case 'May':
          frenchMonth = 'Mai';
          break;
        case 'Jun':
          frenchMonth = 'Juin';
          break;
        case 'Jul':
          frenchMonth = 'Juil';
          break; 
        case 'Aug':
          frenchMonth = 'Août';
          break;
        case 'Sep':
          frenchMonth = 'Sept';
          break;
        case 'Oct':
          frenchMonth = 'Oct';
          break; 
        case 'Nov':
          frenchMonth = 'Nov';
          break;
        case 'Dec':
          frenchMonth = 'Déc';
          break;
        default:
          frenchMonth = 'Jan';
    }

    date[1] = frenchMonth;
    return date;
  }

  convertDayToFrench(date: Array<string>) : Array<string> {
    let day = date[0];
    let frenchDay = '';

    switch(day) {
        case 'Mon':
          frenchDay = 'Lun';
          break; 
        case 'Tue':
          frenchDay = 'Mar';
          break;
        case 'Wed':
          frenchDay = 'Mer';
          break;
        case 'Thu':
          frenchDay = 'Jeu';
          break; 
        case 'Fri':
          frenchDay = 'Ven';
          break;
        case 'Sat':
          frenchDay = 'Sam';
          break;
        case 'Sun':
          frenchDay = 'Dim';
          break; 
        default:
          frenchDay = 'Lun';
    }

    date[0] = frenchDay;
    return date;
  }

  getDayFullString(day: string) : string {
    let fullday = day;

    switch(day) {
        case 'Lun':
          fullday = 'Lundi';
          break; 
        case 'Mar':
          fullday = 'Mardi';
          break;
        case 'Mer':
          fullday = 'Mercredi';
          break;
        case 'Jeu':
          fullday = 'Jeudi';
          break; 
        case 'Ven':
          fullday = 'Vendredi';
          break;
        case 'Sam':
          fullday = 'Samedi';
          break;
        case 'Dim':
          fullday = 'Dimanche';
          break;         
    }
    return fullday;
  }

  getMonthFullString(month: string) : string {
    let fullmonth = month;

    switch(month) {
      case 'Jan':
        fullmonth = 'Janvier';
        break; 
      case 'Fév':
        fullmonth = 'Février';
        break;
      case 'Mars':
        fullmonth = 'Mars';
        break;
      case 'Avr':
        fullmonth = 'Avril';
        break; 
      case 'Mai':
        fullmonth = 'Mai';
        break;
      case 'Juin':
        fullmonth = 'Juin';
        break;
      case 'Juil':
        fullmonth = 'Juillet';
        break; 
      case 'Août':
        fullmonth = 'Août';
        break;
      case 'Sept':
        fullmonth = 'Septembre';
        break;
      case 'Oct':
        fullmonth = 'Octobre';
        break; 
      case 'Nov':
        fullmonth = 'Novembre';
        break;
      case 'Déc':
        fullmonth = 'Décembre';
        break;       
    }
    return fullmonth;
  }
}
  