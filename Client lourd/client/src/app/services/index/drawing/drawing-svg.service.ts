import { ElementRef, Injectable } from '@angular/core';
import { VectorObject } from 'src/app/interfaces/drawing/vectorObject';
import { Color } from 'src/app/model/color';
import { Drawing } from 'src/app/model/drawing';

@Injectable({
    providedIn: 'root',
})
export class DrawingSvgService {

    clearAll() {

        console.log()
        this.componentsSVG = [];
        this.selectedByUser = '';
        this.objects = new Map<string, SVGGraphicsElement>();
        this.gObjects = new Map<string, SVGGraphicsElement>();
        this.sortedGElements = [];

        const constindex = this.svg.nativeElement.children.length
        for (let index = 1; index < constindex; index) {

            const element = this.svg.nativeElement.children[index];
            if(element){
                element.remove();
            } else {
                index ++;
            }
        }

    }

    serverElements: Array<VectorObject> = [];
    drawing_version = 0;
    drawing_versions = 0;
    

    private readonly DEFAULT_WIDTH: number = 1200;
    private readonly DEFAULT_HEIGHT: number = 800;

    componentsSVG: SVGElement[] = [];
    svg: ElementRef<SVGElement>;
    timeout: number;

    isModalOpened: boolean; // see if the create drawing modal screen is opened

    tempSvg: HTMLElement | null;
    passedWorkspace: boolean;
    private drawing: Drawing = new Drawing();
    public selectedByUser = '';

    public objects: Map<string, SVGGraphicsElement> =  new Map<string, SVGGraphicsElement>();
    public gObjects: Map<string, SVGGraphicsElement> =  new Map<string, SVGGraphicsElement>();
    public sortedGElements: Array<SVGGraphicsElement> = [];

    savedWidth: number;
    savedHeight: number;
    changes: MutationObserver;
    selectionChoosed: boolean;
    eraserChoosed: boolean;

    public choosedDrawing: string = "";

    constructor() {
        this.isModalOpened = false;
        this.passedWorkspace = false;
        this.savedWidth = this.DEFAULT_WIDTH;
        this.savedHeight = this.DEFAULT_HEIGHT;
        this.selectionChoosed = false;
    }

    isSvgEmpty(): boolean {
        return this.componentsSVG.length === 0;
    }

    setDrawingAttr(width: number, height: number, color: Color): void {

        this.drawing.size.width = width;
        this.drawing.size.height = height;
        this.drawing.color = color;
        if (this.svg == undefined) {
            return;
        }

        if (this.svg && this.svg.nativeElement) {
            this.svg.nativeElement.children[0].setAttribute('fill', this.drawing.color.hex);
            this.svg.nativeElement.setAttribute('width', this.drawing.size.width.toString());
            this.svg.nativeElement.setAttribute('height', this.drawing.size.height.toString());
            this.svg.nativeElement.style.backgroundColor = this.drawing.color.hex;
        }
    }

    pushElement(element: SVGElement, svg: ElementRef<SVGElement>): void {
        if (svg == undefined) {
            return;
        }
        svg.nativeElement.appendChild(element);
        this.componentsSVG.push(element);
    }

    pushElementToMainSVG(element: SVGElement): void {
        if (this.svg == undefined) {
            return;
        }
        this.svg.nativeElement.appendChild(element);
        this.componentsSVG.push(element);
    }

    hasElement(element: SVGElement): boolean {
      return this.componentsSVG.includes(element);
    }

    public newSVGRender() {
        
        this.sortedGElements.forEach((g: SVGGraphicsElement) => {
            console.log(g)
            this.svg.nativeElement.removeChild(g);
        })

        this.sortedGElements = this.sortedGElements.sort(this.compare);

        this.sortedGElements.forEach((g: SVGGraphicsElement) =>{
            this.svg.nativeElement.appendChild(g);
            console.log(g)
        })

    }

    private compare(a: SVGGraphicsElement, b: SVGGraphicsElement) {

        if (parseInt(a.getAttribute('z') as string) < parseInt(b.getAttribute('z') as string)){
            return -1;
        }

        if (parseInt(a.getAttribute('z') as string) > parseInt(b.getAttribute('z') as string)){
           return 1;
        }
        
        return 0;
    }
}

export interface editable {
    stroke : number
}
