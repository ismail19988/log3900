import { Component, OnDestroy } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
/* //Utile plus tard
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { Message } from '../../../../../common/communication/message';
import { IndexService } from '../../services/index/index.service';*/
import { Subscription } from 'rxjs';

export let browserRefresh = false;
@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnDestroy {
    subscription: Subscription;
    readonly title: string = 'LOG2990';
    // Useful later
    // message = new BehaviorSubject<string>('');
    // inspiré de :https://stackblitz.com/edit/angular-r6-detect-browser-refresh?file=src%2Fapp%2Fapp.component.ts
    constructor(private router: Router) {
        this.subscription = this.router.events.subscribe((event) => {
            if (event instanceof NavigationStart) {
                browserRefresh = !this.router.navigated;
            }
        });
    }

    ngOnDestroy(): void {
        this.subscription.unsubscribe();
    }
}
