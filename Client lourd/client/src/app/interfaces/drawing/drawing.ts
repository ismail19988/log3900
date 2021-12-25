import { Privacy } from '../../Enum/privacy';
import { VectorObject } from './vectorObject';

export interface IDrawing  {
    name                     :   string,
    owner                    :   string,
    password                 :   string,
    creationTimestamp        :   number,
    privacy                  :   Privacy,
    objects                  :   Array<VectorObject>,
    preview                  :   string,
    email                    :   string,
    firstname                :   string,
    lastname                 :   string,
    team                     :   string | undefined
}