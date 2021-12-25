import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class SelectionScaleService {

    readonly TOP: number = 0;
    readonly RIGHT: number = 1;
    readonly LEFT: number = 2;
    readonly BOTTOM: number = 3;
    
    oppositeBound: boolean;

    domRect = {
        x: 0,
        y: 0,
        x2: 0,
        y2: 0,
        width: 0,
        height: 0,
    };

    multipleSelection: SVGGraphicsElement[] = [];
    controlPoint: number;
    constructor() {
        this.oppositeBound = false;
    }

    public calculateScale(event: MouseEvent): { Xt: number, Yt: number, Xs: number, Ys: number } {
        this.newBounds(event);
        return this.getNewTransformation(event);
    }

    private getNewTransformation(event: MouseEvent): { Xt: number, Yt: number, Xs: number, Ys: number } {

        return { Xt: this.getBound().x, Yt: this.getBound().y, Xs: this.calculateX(event), Ys: this.calculateY(event) };
    }


    private newBounds(event: MouseEvent): void {

        switch (this.controlPoint) {
            case this.TOP:
                this.switchTopBounds(event);
                break;
            case this.BOTTOM:
                this.switchBottomBounds(event);
                break;
            case this.LEFT:
                this.switchLeftBounds(event);
                break;
            case this.RIGHT:
                this.switchRightBounds(event);
                break;
        }

    }

    private switchTopBounds(event: MouseEvent): void {
        if (event.offsetY >= this.domRect.y2 && !this.oppositeBound) {
            this.oppositeBound = true;
        } else if (event.offsetY <= this.domRect.y && this.oppositeBound) {
            this.oppositeBound = false;
        }
    }

    private switchBottomBounds(event: MouseEvent): void {
        if (event.offsetY <= this.domRect.y && !this.oppositeBound) {
            this.oppositeBound = true;
        } else if (event.offsetY >= this.domRect.y2 && this.oppositeBound) {
            this.oppositeBound = false;
        }
    }

    private switchLeftBounds(event: MouseEvent): void {
        if (event.offsetX >= this.domRect.x2 && !this.oppositeBound) {
            this.oppositeBound = true;
        } else if (event.offsetX <= this.domRect.x && this.oppositeBound) {
            this.oppositeBound = false;
        }
    }

    private switchRightBounds(event: MouseEvent): void {
        if (event.offsetX <= this.domRect.x && !this.oppositeBound) {
            this.oppositeBound = true;
        } else if (event.offsetX >= this.domRect.x2 && this.oppositeBound) {
            this.oppositeBound = false;
        }
    }

    private getBound(): { x: number; y: number } {
        switch (this.controlPoint) {
            case this.TOP:
                return this.oppositeBound ?
                 { x: this.domRect.x + this.domRect.width / 2, y: this.domRect.y } :
                 { x: this.domRect.x + this.domRect.width / 2, y: this.domRect.y + this.domRect.height };
            case this.BOTTOM:
                return this.oppositeBound ?
                 { x: this.domRect.x + this.domRect.width / 2, y: this.domRect.y + this.domRect.height } :
                 { x: this.domRect.x + this.domRect.width / 2, y: this.domRect.y };
            case this.LEFT:
                return this.oppositeBound ?
                 { x: this.domRect.x, y: this.domRect.y + this.domRect.height / 2 } :
                 { x: this.domRect.x + this.domRect.width, y: this.domRect.y + this.domRect.height / 2 };
            case this.RIGHT:
            default:
                return this.oppositeBound ?
                 { x: this.domRect.x + this.domRect.width, y: this.domRect.y + this.domRect.height / 2 } :
                 { x: this.domRect.x, y: this.domRect.y + this.domRect.height / 2 };
        }
    }

    private calculateX(event: MouseEvent) {
        let ratio = 1;
        switch (this.controlPoint) {
            case this.LEFT:
                this.oppositeBound ?
                ratio = Math.abs((event.offsetX - this.domRect.x) / (this.domRect.x2 - this.domRect.x)) :
                ratio = Math.abs((event.offsetX - this.domRect.x2) / (this.domRect.x2 - this.domRect.x));
                if (this.domRect.x2 === this.domRect.x) {
                    ratio = 1;
                }
                break;
            case this.RIGHT:
                this.oppositeBound ?
                ratio = Math.abs((event.offsetX - this.domRect.x2) / (this.domRect.x2 - this.domRect.x)) :
                ratio = Math.abs((event.offsetX - this.domRect.x) / (this.domRect.x2 - this.domRect.x));
                if (this.domRect.x2 === this.domRect.x) {
                    ratio = 1;
                }
                break;
            default:
                ratio = 1;
        }

        return ratio;
    }

    private calculateY(event: MouseEvent) {
        let ratio = 1;
        switch (this.controlPoint) {
            case this.TOP:
                this.oppositeBound ?
                ratio = Math.abs((event.offsetY - this.domRect.y) / (this.domRect.y2 - this.domRect.y)) :
                ratio = Math.abs((event.offsetY - this.domRect.y2) / (this.domRect.y2 - this.domRect.y));
                if (this.domRect.y2 === this.domRect.y) {
                    ratio = 1;
                }
                break;
            case this.BOTTOM:
                this.oppositeBound ?
                ratio = Math.abs((event.offsetY - this.domRect.y2) / (this.domRect.y2 - this.domRect.y)) :
                ratio = Math.abs((event.offsetY - this.domRect.y) / (this.domRect.y2 - this.domRect.y));
                if (this.domRect.y2 === this.domRect.y) {
                    ratio = 1;
                }
                break;
            default:
                ratio = 1;
        }
        return ratio;
    }

}
