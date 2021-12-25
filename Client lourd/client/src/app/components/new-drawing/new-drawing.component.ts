import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Color } from 'src/app/model/color';
import { Size } from 'src/app/model/drawing';
import { MatDialogRef } from '@angular/material/dialog';
import { DrawingSvgService } from 'src/app/services/index/drawing/drawing-svg.service';

@Component({
    selector: 'app-new-drawing',
    templateUrl: './new-drawing.component.html',
    styleUrls: ['./new-drawing.component.scss'],
})
export class NewDrawingComponent implements OnInit {

constructor(public dialogRef: MatDialogRef<NewDrawingComponent>,
            public drawingSvgService: DrawingSvgService, public router: Router) {}
    readonly NB_LETTER_HEX: number = 7;
    readonly WIDTH_OFFSET: number = 70;
    readonly HEIGHT_OFFSET: number = 25;
    readonly RGB_MAX: number = 255;
    readonly LENGHT_HEX_COLOR: number = 7;
    readonly HALF_SECOND: number = 500;

    readonly paletteColors: string[] = ['#ffffff', '#a9a9a9', '#000000', '#800000', '#9A6324',
        '#000075', '#e6194B', '#f58231', '#ffe119', '#32CD32', '#037d50', '#42d4f4', '#911eb4', '#ff69b4',
    '#cf323c', '#2cffef', '#561810', '#bcef8f'];
    private size: Size = { width: 300, height: 300 };
    private color: Color = new Color();

    /*
    Debounce and function to replace width and height
    ressource: https://stackoverflow.com/questions/39300526/how-i-can-detect-window-resize-instantly-in-angular-2/44393557
    */
    // resizeTimeout: ReturnType<typeof setTimeout>;
    // didSizeChange: boolean = false;
    // tslint:disable-next-line:no-inferrable-types  2 lint error contraire
    private didSizeChange: boolean = false;

    ngOnInit(): void {
        this.size = { width: window.innerWidth - this.WIDTH_OFFSET, height: window.innerHeight - this.HEIGHT_OFFSET };
        this.drawingSvgService.isModalOpened = true;
    }

    createDrawing(): void {
        if (this.size.width == null) {
            alert('Veuillez rentrer une valeur numérique pour la largeur.');
        } else if (this.size.height == null) {
            alert('Veuillez rentrer une valeur numérique pour la hauteur.');
        } else if (this.size.height <= 0 || this.size.width <= 0) {
            alert('Veuiller mettre des valeurs de dimensions positives.');
        } else if (this.color.r == null || this.color.g == null || this.color.b == null) {
            alert('Veuiller mettre une valeur pour les couleurs r, g et b');
        } else {
            if (this.updateHex()) {
                let canCreateNew: boolean = !this.drawingSvgService.isSvgEmpty();
                if (canCreateNew) {
                    canCreateNew = !window.confirm('Est-ce que vous êtes sur que vous voulez écraser vos modifications.');
                }

                if (!canCreateNew) {
                    this.drawingSvgService.setDrawingAttr(this.size.width, this.size.height, this.color);
                    this.drawingSvgService.passedWorkspace = true;
                    this.closeWindow();
                    this.router.navigate(['workspace']);
                }
            }
        }
    }

    private updateHex(): boolean {
        if (this.color.hex.length !== this.LENGHT_HEX_COLOR) {
            alert("Le format de la couleur doit être de longueur 7 qui commence avec un '#' et finit avec un 6 chiffre hexadécimal");
            this.reset();
            return false;
        } else if (!this.validateHex()) {
            alert("La valeur que vous avez founi pour la valeur hexadecimale n'est pas correcte");
            this.reset();
            return false;
        }
        this.color.syncHexWithRGB();
        return true;
    }

    updateRGB(): void {
        if (!(Number(this.color.r) >= 0 && Number(this.color.r) <= this.RGB_MAX &&
            Number(this.color.g) >= 0 && Number(this.color.g) <= this.RGB_MAX &&
            Number(this.color.b) >= 0 && Number(this.color.b) <= this.RGB_MAX)) {
            alert('Les valeurs de rgb doivent être tous être entre 0 et 255');
            this.reset();
        } else {
            this.color.syncRGBWithHex();
        }
    }

    palColor(color: string): void {
        this.color.hex = color.toUpperCase();
        this.color.syncHexWithRGB();
    }

    private reset(): void {
        this.color.hex = '#FFFFFF';
        this.color.r = this.RGB_MAX;
        this.color.g = this.RGB_MAX;
        this.color.b = this.RGB_MAX;
    }

    updateNumber(event: KeyboardEvent, lastNumber: number): void {
        const isNumber: boolean = event.key.charCodeAt(0) >= '0'.charCodeAt(0) && event.key.charCodeAt(0) <= '9'.charCodeAt(0);
        const isDelete: boolean = event.key === 'Backspace';
        const isArrow: boolean = event.key.substr(0, 'Arrow'.length) === 'Arrow';

        const MAX_DIM = 1000;

        if ((isNumber && lastNumber < MAX_DIM) || isDelete) {
            this.didSizeChange = true;
        } else if (!isArrow) {
            event.preventDefault();
        }
    }

    private validateHex(): boolean {
        this.color.hex = this.color.hex.toUpperCase();
        if (this.color.hex[0] !== '#') {
            return false;
        }
        const hex = this.color.hex.substr(1);
        for (let i = 0; i < hex.length; i++) {
            const value = hex.charCodeAt(i);
            if (!((value >= 'A'.charCodeAt(0) && value <= 'F'.charCodeAt(0)) ||
                (value >= '0'.charCodeAt(0) && value <= '9'.charCodeAt(0)))) {
                return false;
            }
        }
        return true;
    }

    // close the modal window
    private closeWindow(): void {
        this.dialogRef.close();
    }
    @HostListener('window:resize')
    onWindowResize(): void {
        setTimeout(
            (() => {
                if (!this.didSizeChange) {
                    this.size.width = window.innerWidth - this.WIDTH_OFFSET;
                    this.size.height = window.innerHeight - this.HEIGHT_OFFSET;
                }
            }).bind(this),
            this.HALF_SECOND,
        );
    }

    @HostListener('document:keydown', ['$event'])
    handleKeyboardEvent(e: KeyboardEvent): void {
        if (e.ctrlKey) {
            e.preventDefault();
            e.stopPropagation();
        }
    }
}
