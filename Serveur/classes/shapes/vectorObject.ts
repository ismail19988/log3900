import { IMatrix } from "../../interfaces/drawing/matrix";
import { Point } from "../../interfaces/drawing/point";

export abstract class VectorObjectClass {

    constructor(
        protected id: string,
        protected isSelected: boolean,
        protected z: number,
        protected strokeWidth: number,
        protected color: string,
        protected matrix: IMatrix
    ) {  } 

    public getId(): string {
        return this.id
    }

    public getMatrix(): IMatrix {
        return this.matrix;
    }
    public getIsSelected(): boolean {
        return this.isSelected;
    }

    public getZ(): number {
        return this.z;
    }

    public getColor(): string {
        return this.color;
    }

    public getStrokeWidth(): number {
        return this.strokeWidth;
    }

    public setZ(newZ: number): void {
        this.z = newZ;
    }

    public setIsSelected(isSelected: boolean) {
        this.isSelected = isSelected;
    }

    public setMatrix(Matrix:IMatrix){
        this.matrix = JSON.parse(JSON.stringify(Matrix));
    }

    public changeColor(color: string): void  {
        this.color = color;
    }


    public setStrokeWidth(strokeWidth: number) {
        this.strokeWidth = strokeWidth;
    }

}