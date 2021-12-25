import Document from 'mongoose';
import { Privacy } from '../../Enum/privacy';
import { VectorObject } from './vectorObject';

export interface IDrawingDB extends Document  {
    name                     :   string,
    owner                    :   string,
    password                 :   string,
    team                     :   string | undefined,
    creationTimestamp        :   number,
    privacy                  :   Privacy,
    objects                  :   Array<VectorObject>
    preview                  :   string,
    version                  :   number,
    versions                 :   number,
    z                        :   number
}

export interface IDrawing  {
    name                     :   string,
    owner                    :   string,
    password                 :   string,
    creationTimestamp        :   number,
    privacy                  :   Privacy,
    objects                  :   Array<VectorObject>,
    preview                  :   string,
    team                     :   string | undefined,
    version                  :   number,
    versions                 :   number,
    z                        :   number
}   

export interface version {
    name                      : string,
    versions                  : Array<{ objects : VectorObject[] }>
}