import { Shape } from "../../interfaces/drawing/shape";
import { ShapeClass } from "./shape";

export class EllipseClass extends ShapeClass {
    constructor(newShape: Shape) {
        super(newShape);
    }
}