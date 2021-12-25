export class Ellipse {
    startX: number;
    startY: number;
    cx: number;
    cy: number;
    radiusX: number;
    radiusY: number;
    isCircle: boolean;
    strokeWidth: number;
    strokeColor: string;
    fill: string;

    constructor() {
        this.startX = 0;
        this.startY = 0;
        this.cx = 0;
        this.cy = 0;
        this.radiusX = 0;
        this.radiusY = 0;
        this.isCircle = false;
        this.strokeWidth = 0;
        this.strokeColor = 'black';
        this.fill = 'black';
    }
}
