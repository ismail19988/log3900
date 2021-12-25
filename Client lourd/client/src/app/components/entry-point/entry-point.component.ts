import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DrawingSvgService } from 'src/app/services/index/drawing/drawing-svg.service';
import { NewDrawingComponent } from '../new-drawing/new-drawing.component';

@Component({
    selector: 'app-entry-point',
    templateUrl: './entry-point.component.html',
    styleUrls: ['./entry-point.component.scss'],
})
export class EntryPointComponent {

    @ViewChild('continueDrawing', { static: false }) continueRef: ElementRef;

    continueDisabled: boolean;
    constructor(public dialog: MatDialog, public drawingSvgService: DrawingSvgService) {
        this.isLocalDrawingSaved();
        this.continueDisabled = true;
    }

    @HostListener('window:keydown', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent): void {
        if (event.ctrlKey && !this.drawingSvgService.isModalOpened) {
            event.preventDefault();
            event.stopPropagation();

            if (event.key.toLowerCase() === 'o') {
                this.openNewDrawing();
            } else if (event.key.toLowerCase() === 'g') {
                this.openGallery();
            }
        }
    }

    openNewDrawing(): void {
        this.dialog
            .open(NewDrawingComponent, {
                width: '500px',
            })
            .afterClosed()
            .subscribe(() => {
                this.drawingSvgService.isModalOpened = false;
            });
    }

    openGallery(): void {
    }

    openGuide(): void {
    }

    continueDrawing(): void {
    }

    isLocalDrawingSaved(): void {
    }
}
