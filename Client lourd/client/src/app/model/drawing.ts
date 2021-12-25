import { Color } from './color';

export class Drawing {
    constructor(public size: Size = {width : 1808, height : 1092}, public color: Color = new Color()) {}
}

export interface Size {
    width: number | null;
    height: number | null;
}
