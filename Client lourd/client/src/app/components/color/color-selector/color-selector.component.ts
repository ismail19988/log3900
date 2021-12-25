import { AfterViewInit, Component, ElementRef, EventEmitter, HostListener, Input,
         OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { ColorService, RGBColor } from 'src/app/services/index/drawing/color.service';

@Component({
    selector: 'app-color-selector',
    templateUrl: './color-selector.component.html',
    styleUrls: ['./color-selector.component.scss'],
})
export class ColorSelectorComponent implements OnChanges, AfterViewInit {
    @Input()
    color: string;

    @Output()
    primContainerSelected: EventEmitter<boolean> = new EventEmitter();

    @ViewChild('colorSelector', { static: false })
    colorSelector: ElementRef<HTMLCanvasElement>;

    @ViewChild('primaryColorContainer', { static: false })
    primaryContainer: ElementRef<HTMLCanvasElement>;

    @ViewChild('secondaryColorContainer', { static: false })
    secondaryContainer: ElementRef<HTMLCanvasElement>;

    @ViewChild('lastColorsContainer', { static: false })
    lastColorDiv: ElementRef<HTMLCanvasElement>;

    afterViewCalled: boolean;
    leftClick: boolean;
    selectedX: number;
    selectedY: number;

    private readonly POSITION_ADJUST_RECT: number = 5;
    private readonly DIMENSIONS_RECT: number = 10;
    private readonly INITIAL_POS_X: number = 110;
    private readonly INITIAL_POS_Y: number = 100;

    private renderer: CanvasRenderingContext2D;

    constructor(private colorServ: ColorService) {
        this.afterViewCalled = false;
        this.leftClick = false;
        this.selectedX = this.INITIAL_POS_X;
        this.selectedY = this.INITIAL_POS_Y;
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.color && this.afterViewCalled) { this.drawSelector(); }
    }

    ngAfterViewInit(): void {
        this.afterViewCalled = true;
        this.update();
    }

    @HostListener('window:mouseup', ['$event'])
    onMouseUp(event: MouseEvent): void {
        if (event.button === 0) { this.leftClick = false; }
        this.update();
    }

    onSelectorClick(event: MouseEvent): void {
        this.leftClick = true;
        this.renderer = this.colorSelector.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.updateColor(event);
    }

    onSelectorMovement(event: MouseEvent): void {
        if (this.leftClick && event.offsetX < this.colorSelector.nativeElement.width
            && event.offsetY < this.colorSelector.nativeElement.height) {
            this.updateColor(event);
        }
    }

    onSelectorMouseUp(event: MouseEvent): void {
        if (event.button === 0) {
            this.leftClick = false;
            this.updateColor(event);
            this.emitColorAtPosition(this.selectedX, this.selectedY);
        }
    }

    updateColor(event: MouseEvent): void {
        this.selectedX = event.offsetX;
        this.selectedY = event.offsetY;
        this.drawSelector();
    }

    /*
     * Source of drawing : https://malcoded.com/posts/angular-color-picker/
     */
    drawSelector(): void {
        const width = this.colorSelector.nativeElement.width;
        const height = this.colorSelector.nativeElement.height;

        this.renderer = this.colorSelector.nativeElement.getContext('2d') as CanvasRenderingContext2D;

        this.renderer.fillStyle = this.colorServ.getStringBaseColor();
        this.renderer.fillRect(0, 0, width, height);

        const whiteGrad = this.renderer.createLinearGradient(0, 0, width, 0);
        whiteGrad.addColorStop(0, 'rgba(255,255,255,1)');
        whiteGrad.addColorStop(1, 'rgba(255,255,255,0)');
        this.renderer.fillStyle = whiteGrad;
        this.renderer.fillRect(0, 0, width, height);

        const blackGrad = this.renderer.createLinearGradient(0, 0, 0, height);
        blackGrad.addColorStop(0, 'rgba(0,0,0,0)');
        blackGrad.addColorStop(1, 'rgba(0,0,0,1)');
        this.renderer.fillStyle = blackGrad;
        this.renderer.fillRect(0, 0, width, height);
        this.renderer.strokeStyle = 'white';
        this.renderer.fillStyle = 'white';

        this.renderer.beginPath();
        this.renderer.rect(this.selectedX - this.POSITION_ADJUST_RECT,
            this.selectedY - this.POSITION_ADJUST_RECT, this.DIMENSIONS_RECT, this.DIMENSIONS_RECT);
        this.renderer.lineWidth = 2;
        this.renderer.stroke();
    }

    /*
     * Source of code : https://malcoded.com/posts/angular-color-picker/
     */
    emitColorAtPosition(x: number, y: number): void {
        const imageData = this.renderer.getImageData(x, y, 1, 1).data;
        const color: RGBColor = { r: imageData[0], g: imageData[1], b: imageData[2] };
        if(this.colorServ.getColorToPick() === 'primary'){
            this.colorServ.setPrimarySelectedRGB(color);
        }else if(this.colorServ.getColorToPick() === 'secondary'){
            this.colorServ.setSecondarySelectedRGB(color);
        }else{
            this.colorServ.setTertiarySelectedRGB(color);
        }
        this.update();
    }

    update(): void {
        this.drawSelector();
    }
}
