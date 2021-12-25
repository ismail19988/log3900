import { AfterViewInit, Component, ElementRef, EventEmitter, HostListener,
         Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { ColorService, RGBColor } from 'src/app/services/index/drawing/color.service';

@Component({
    selector: 'app-color-picker',
    templateUrl: './color-picker.component.html',
    styleUrls: ['./color-picker.component.scss'],
})

/*
 * Source for logic and drawing : https://malcoded.com/posts/angular-color-picker/
 */
export class ColorPickerComponent implements AfterViewInit, OnChanges {

    @Input()
    primContainerSelected: boolean;

    @Output()
    color: EventEmitter<string> = new EventEmitter();

    @ViewChild('slider', { static: false })
    private slider: ElementRef<HTMLCanvasElement>;

    @ViewChild('marker', { static: false })
    private marker: ElementRef<HTMLCanvasElement>;

    @ViewChild('transparency', { static: false })
    private transparency: ElementRef<HTMLCanvasElement>;

    @ViewChild('transparencyMarker', { static: false })
    private transparencyMarker: ElementRef<HTMLCanvasElement>;

    private renderer: CanvasRenderingContext2D;

    private readonly MIN_SLIDER_VALUE: number = 0;
    private readonly MAX_SLIDER_VALUE: number = 100;
    private readonly TRANSP_SLIDER_HEIGHT: number = 200;
    private readonly HEIGHT_ADJUST: number = 10;
    private readonly HEXADECIMAL: number = 16;
    private readonly DECIMAL: number = 10;
    private readonly RG_STOP: number = 0.17;
    private readonly G_STOP: number = 0.34;
    private readonly GB_STOP: number = 0.51;
    private readonly B_STOP: number = 0.68;
    private readonly RB_STOP: number = 0.8;
    private readonly R_STOP: number = 0.95;

    colorHeight: number;
    afterViewCalled: boolean;
    transparencyHeight: number;
    sliderClicked: boolean;
    transpClicked: boolean;

    constructor(private colorServ: ColorService) {
        this.afterViewCalled = false;
        this.colorHeight = 0;
        this.transparencyHeight = 0;
        this.sliderClicked = false;
        this.transpClicked = false;
    }

    ngAfterViewInit(): void {
        this.afterViewCalled = true;
        this.transparencyHeight = (-this.colorServ.getPrimaryTransparency() * this.TRANSP_SLIDER_HEIGHT) + this.TRANSP_SLIDER_HEIGHT;
        this.drawColorSlider();
        this.drawSliderTransparency();
        this.drawMarkerTransparency(this.transparencyHeight);
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.primContainerSelected && this.afterViewCalled) {
            this.updateTransparency(this.primContainerSelected);
        }
    }
    /*
     * Source of drawing : https://malcoded.com/posts/angular-color-picker/
     */
    drawColorSlider(): void {
        this.renderer = this.slider.nativeElement.getContext('2d') as CanvasRenderingContext2D;

        const sliderwidth = this.slider.nativeElement.width;
        const sliderheight = this.slider.nativeElement.height;

        this.renderer.beginPath();
        const rainbow = this.renderer.createLinearGradient(0, 0, 0, sliderheight);
        {
            rainbow.addColorStop(0, 'rgba(255, 0, 0, 1)');
            rainbow.addColorStop(this.RG_STOP, 'rgba(255, 255, 0, 1)');
            rainbow.addColorStop(this.G_STOP, 'rgba(0, 255, 0, 1)');
            rainbow.addColorStop(this.GB_STOP, 'rgba(0, 255, 255, 1)');
            rainbow.addColorStop(this.B_STOP, 'rgba(0, 0, 255, 1)');
            rainbow.addColorStop(this.RB_STOP, 'rgba(255, 0, 255, 1)');
            rainbow.addColorStop(this.R_STOP, 'rgba(255, 0, 0, 1)');
            rainbow.addColorStop(1, 'rgba(0, 0, 0, 1)');
        }

        this.renderer.fillStyle = rainbow;
        this.renderer.rect(0, 0, sliderwidth, sliderheight);
        this.renderer.fill();
        this.renderer.closePath();

        this.renderer = this.marker.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.renderer.clearRect(0, 0, this.marker.nativeElement.width, this.marker.nativeElement.height);
        this.renderer.beginPath();
        this.renderer.moveTo(0, this.colorHeight);
        this.renderer.lineTo(this.HEIGHT_ADJUST, this.colorHeight - this.HEIGHT_ADJUST);
        this.renderer.lineTo(this.HEIGHT_ADJUST, this.colorHeight + this.HEIGHT_ADJUST);
        this.renderer.closePath();
        this.renderer.fillStyle = '#000000';
        this.renderer.fill();
        this.renderer = this.slider.nativeElement.getContext('2d') as CanvasRenderingContext2D;
    }

    colorPress(event: MouseEvent): void {
        this.sliderClicked = true;
        this.changeColor(event);
    }

    moveColor(event: MouseEvent): void {
        this.sliderClicked ? this.changeColor(event) : (this.sliderClicked = false);
    }

    changeColor(event: MouseEvent): void {
        this.colorHeight = event.offsetY;
        this.emitColor(event.offsetX, event.offsetY);
    }

    /*
     * Source of this code : https://malcoded.com/posts/angular-color-picker/
     */
    emitColor(x: number, y: number): void {
        const imageData = this.renderer.getImageData(x, y, 1, 1).data;
        const color: RGBColor = { r: imageData[0], g: imageData[1], b: imageData[2] };
        this.colorServ.setBaseRGB(color);
        this.color.emit(this.colorServ.getStringBaseColor());
        this.drawColorSlider();
    }

    /*
     * Source of drawing : https://malcoded.com/posts/angular-color-picker/
     */
    drawSliderTransparency(): void {
        this.renderer = this.transparency.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        const sliderwidth = this.transparency.nativeElement.width;
        const sliderheight = this.transparency.nativeElement.height;

        this.renderer.beginPath();
        const transparentGradient = this.renderer.createLinearGradient(0, 0, 0, sliderheight);
        {
            transparentGradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
            transparentGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        }
        this.renderer.fillStyle = transparentGradient;
        this.renderer.rect(0, 0, sliderwidth, sliderheight);
        this.renderer.fill();
        this.renderer.closePath();

    }

    drawMarkerTransparency(height: number): void {
        this.renderer = this.transparencyMarker.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.renderer.clearRect(0, 0, this.transparencyMarker.nativeElement.width, this.transparencyMarker.nativeElement.height);
        this.renderer.beginPath();
        this.renderer.moveTo(0, height);
        this.renderer.lineTo(this.HEIGHT_ADJUST, height - this.HEIGHT_ADJUST);
        this.renderer.lineTo(this.HEIGHT_ADJUST, height + this.HEIGHT_ADJUST);
        this.renderer.closePath();
        this.renderer.fillStyle = '#000000';
        this.renderer.fill();
        this.renderer = this.slider.nativeElement.getContext('2d') as CanvasRenderingContext2D;
    }

    transparencyPress(evt: MouseEvent): void {
        this.transpClicked = true;
        this.transparencyHeight = evt.offsetY;
        this.drawMarkerTransparency(this.transparencyHeight);
        this.emitTransparency(evt.offsetY);
    }

    transparencyMove(evt: MouseEvent): void {
        this.transparencyHeight = evt.offsetY;
        if (this.transpClicked) {
            this.drawMarkerTransparency(this.transparencyHeight);
            this.emitTransparency(evt.offsetY);
        }
    }

    emitTransparency(height: number): void {
        const PERCENT = 100;
        this.renderer = this.transparency.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        let newAlpha = Math.round(PERCENT *
            ((this.transparency.nativeElement.height - height) / this.transparency.nativeElement.height)) / PERCENT;

        if(newAlpha <= 0.1){
            newAlpha = 0.1;
        }
        
        if(this.colorServ.getColorToPick() === 'primary'){
            this.colorServ.setPrimaryTransparency(newAlpha);
        }else if(this.colorServ.getColorToPick() === 'secondary'){
            this.colorServ.setSecondaryTransparency(newAlpha);
        }else{
            this.colorServ.setTertiaryTransparency(newAlpha);
        }
        this.renderer = this.slider.nativeElement.getContext('2d') as CanvasRenderingContext2D;
    }

    @HostListener('window:mouseup', ['$event'])
    mouseUp(evt: MouseEvent): void {
        this.sliderClicked = false;
        this.transpClicked = false;
    }

    onSearchChange(event: KeyboardEvent, input: HTMLInputElement): void {
        if (!isNaN(parseInt(event.key, this.HEXADECIMAL)) || event.key === 'Backspace' || event.key === 'Shift') {
            if(this.colorServ.getColorToPick() === 'primary'){
                this.colorServ.setPrimarySelectedRGB(this.createBuilder());
            }else if(this.colorServ.getColorToPick() === 'secondary'){
                this.colorServ.setSecondarySelectedRGB(this.createBuilder());
            }else{
                this.colorServ.setTertiarySelectedRGB(this.createBuilder());
            }
            this.color.emit('');

        } else {
            input.value = '';
        }
    }

    onTransparencyChange(event: KeyboardEvent, input: HTMLInputElement): void {
        const inputNb = parseInt((input).value, this.DECIMAL);
        if ((!isNaN(parseInt(event.key, this.DECIMAL)) || event.key === 'Backspace')) {
            if (isNaN(inputNb)) {
                input.value = this.MIN_SLIDER_VALUE.toString();
            } else if ( inputNb > this.MAX_SLIDER_VALUE) {
                input.value = this.MAX_SLIDER_VALUE.toString();
            }
        } else {
            input.value = '0';
        }
        this.transpClicked = true;
        // convert value from 0-100 to 200-0
        this.transparencyHeight = this.convertValueToSliderHeight(parseInt(input.value, this.DECIMAL), 2);
        this.drawMarkerTransparency(this.transparencyHeight);
        this.emitTransparency(this.transparencyHeight);
        this.transpClicked = false;
    }

    createBuilder(): RGBColor {
        const inputs = document.getElementsByClassName('colorInput');
        const colorBuilder: RGBColor = {
            r: parseInt((inputs[0] as HTMLInputElement).value, this.HEXADECIMAL),
            g: parseInt((inputs[1] as HTMLInputElement).value, this.HEXADECIMAL),
            b: parseInt((inputs[2] as HTMLInputElement).value, this.HEXADECIMAL),
        };
        return colorBuilder;
    }

    updateTransparency(primSelected: boolean): void {
        if (primSelected) {
            this.transparencyHeight = this.convertValueToSliderHeight(this.colorServ.getPrimaryTransparency(), this.TRANSP_SLIDER_HEIGHT);
        } else {
            // convert value from 0-1 to 200-0
            this.transparencyHeight = this.convertValueToSliderHeight(this.colorServ.getSecondaryTransparency(), this.TRANSP_SLIDER_HEIGHT);
        }
        this.drawMarkerTransparency(this.transparencyHeight);
        this.emitTransparency(this.transparencyHeight);
    }

    private convertValueToSliderHeight(value: number, factor: number): number {
        return (-value * factor) + this.TRANSP_SLIDER_HEIGHT;
    }
}
