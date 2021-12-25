import { IMatrix } from "./matrix";

export interface VectorObject {
    id: string,
    isSelected: boolean,
    z: number,
    color: string,
    strokeWidth: number,
    matrix: IMatrix
}