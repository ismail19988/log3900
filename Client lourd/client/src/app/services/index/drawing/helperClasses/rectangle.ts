export class Rectangle {
    startX: number;
    startY: number;
    x: number;
    y: number;
    width: number;
    height: number;
    isSquare: boolean;
    strokeWidth: number;
    strokeColor: string;
    fill: string;

    constructor() {
        this.startX = 0;
        this.startY = 0;
        this.x = 0;
        this.y = 0;
        this.width = 0;
        this.height = 0;
        this.isSquare = false;
        this.strokeWidth = 0;
        this.strokeColor = 'black';
        this.fill = 'black';
    }
}
