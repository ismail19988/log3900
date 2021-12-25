import { Point } from "../../interfaces/drawing/point";
import { Shape } from "../../interfaces/drawing/shape";
import { VectorObjectClass } from "./vectorObject";

export class ShapeClass extends VectorObjectClass {

    private strokeColor: string;
    private initialPoint: Point;
    private finalPoint: Point;
    private text: string;
    private textColor: string;

    constructor(
        newShape: Shape
    ) {
        super(
            newShape.id,
            newShape.isSelected,
            newShape.z,
            newShape.strokeWidth,
            newShape.color,
            newShape.matrix);
        this.strokeColor = newShape.strokeColor;
        this.initialPoint = newShape.initialPoint;
        this.finalPoint = newShape.finalPoint;
        this.text = newShape.text;
        this.textColor = newShape.textColor;
    }

    public getStrokeColor(): string {
        return this.strokeColor;
    }

    public getInitialPoint(): Point {
        return this.initialPoint;
    }

    public getFinalPoint(): Point {
        return this.finalPoint;
    }

    public getText(): string {
        return this.text;
    }

    public getTextColor(): string {
        return this.textColor;
    }

    public setText(text: string): void {
        this.text = text;
    }

    public setTextcolor(textColor: string): void {
        this.textColor = textColor;
    }

    public setStrokeColor(color: string): void {
        this.strokeColor = color;
    }

    public setInitialPoint(point: Point): void {
        this.initialPoint = point;
    }

    public setFinalPoint(point: Point): void {
        this.finalPoint = point;
    }
}