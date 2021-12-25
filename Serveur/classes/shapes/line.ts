import { Line } from "../../interfaces/drawing/line";
import { Point } from "../../interfaces/drawing/point";
import { VectorObjectClass } from "./vectorObject";

export class LineClass extends VectorObjectClass {

    private points: Array<Point>;

    constructor(
        newLine: Line
    ) {
        super(
            newLine.id,
            newLine.isSelected,
            newLine.z,
            newLine.strokeWidth,
            newLine.color,
            newLine.matrix);
        this.points = newLine.points;
    }

    public getPoints(): Array<Point> {
        return this.points;
    }

    public addPoints(point: Point): void {
        this.points.push(point);
    }
}