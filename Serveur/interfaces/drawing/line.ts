import { Point } from "./point";
import { VectorObject } from "./vectorObject";

export interface Line extends VectorObject {
    points: Array<Point>
}

export function instanceOfLine(object: any): object is Line {
    return 'points' in object;
}