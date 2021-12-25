import { ElementRef, Injectable } from '@angular/core';
import { UtilsService } from 'src/app/interfaces';
import { IMatrix } from 'src/app/interfaces/drawing/matrix';
import { DrawingSvgService } from './drawing-svg.service';

@Injectable({
    providedIn: 'root',
})
export abstract class AbstractToolService implements UtilsService {
    protected readonly DEFAULT_THICKNESS: number = 5;
    svg: ElementRef<SVGElement>;
    protected hasColor: boolean;
    protected hasThickness: boolean;
    protected hasTexture: boolean;
    protected hasTrace: boolean;
    protected hasJunction: boolean;
    protected hasWidth: boolean;
    protected hasDiameter: boolean;
    protected hasFrequency: boolean;
    protected hasTolerance: boolean;
    protected abstract name: string;
    protected thickness: number = this.DEFAULT_THICKNESS;
    id: string = "";

    constructor(public drawingHelper: DrawingSvgService) {
        this.hasColor = false;
        this.hasThickness = false;
        this.hasTexture = false;
        this.hasTrace = false;
        this.hasJunction = false;
        this.hasWidth = false;
        this.hasDiameter = false;
        this.hasFrequency = false;
        this.hasTolerance = false;
    }

    getHasColor(): boolean {
        return this.hasColor;
    }
    getHasThickness(): boolean {
        return this.hasThickness;
    }
    getHasTexture(): boolean {
        return this.hasTexture;
    }
    getHasTrace(): boolean {
        return this.hasTrace;
    }
    getHasJunction(): boolean {
        return this.hasJunction;
    }
    getHasWidth(): boolean {
        return this.hasWidth;
    }
    getHasDiameter(): boolean {
        return this.hasDiameter;
    }
    getHasFrequency(): boolean {
        return this.hasFrequency;
    }
    getHasTolerance(): boolean {
        return this.hasTolerance;
    }
    getName(): string {
        return this.name;
    }
    getThickness(): number {
        return this.thickness;
    }
    abstract setThickness(thickness: number): void;

    mouseDown(event: MouseEvent): void {
        // Does nothing
    }

    mouseUp(event: MouseEvent): void {
        // Does nothing
    }

    mouseMove(event: MouseEvent): void {
        // Does nothing
    }

    mouseLeave(event: MouseEvent): void {
        // Does nothing
    }

    keyDown(event: KeyboardEvent): void {
        // Does nothing
    }

    keyUp(event: KeyboardEvent): void {
        // Does nothing
    }

    doubleClick(event: MouseEvent): void {
        // Does nothing
    }

    generateTransformationMatrix(matrix: IMatrix): DOMMatrix {

        let transformation_matrix = document.querySelector('svg')?.createSVGMatrix();
        transformation_matrix!.a = matrix.a
        transformation_matrix!.b = matrix.b
        transformation_matrix!.c = matrix.c
        transformation_matrix!.d = matrix.d
        transformation_matrix!.e = matrix.e
        transformation_matrix!.f = matrix.f

        return transformation_matrix as DOMMatrix;
    }

    protected rescaleG(id: string, dataMatrix: IMatrix, notFromSelection: boolean): void {

        if(id !== this.id || notFromSelection) {
            let g = this.drawingHelper.gObjects.get(id + "-g");
            g?.transform.baseVal.clear();

            let matrix = this.generateTransformationMatrix(dataMatrix);
            let tr = g?.transform.baseVal.createSVGTransformFromMatrix(matrix as DOMMatrix);

            if(tr){
                g?.transform.baseVal.appendItem(tr);
            }
        }
    }
}
