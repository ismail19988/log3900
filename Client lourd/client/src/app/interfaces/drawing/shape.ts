import { Point } from "./point";
import { VectorObject } from "./vectorObject";

export interface Shape extends VectorObject {
    strokeColor: string,
    initialPoint: Point,
    finalPoint: Point,
    text: string,
    textColor: string
}

export interface TypedShape extends Shape {
    type : string
}

export function instanceOfLine(object: any): object is Shape {
    return 'strokeColor' in object && 'initialPoint' in object && 'finalPoint' in object;
}