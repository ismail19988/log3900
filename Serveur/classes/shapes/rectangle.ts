import { Shape } from "../../interfaces/drawing/shape";
import { ShapeClass } from "./shape";

export class RectangleClass extends ShapeClass {
    constructor(newShape: Shape) {
        super(newShape);
    }
}