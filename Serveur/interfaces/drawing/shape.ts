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

export function instanceOfRectangle(object: any): object is Shape {
    return 'type' in object && object.type == "rectangle";
}

export function instanceOfEllipse(object: any): object is Shape {
    return 'type' in object && object.type == "ellipse";
}