import Document from 'mongoose'
import { IAction } from './IAction';

export interface IUser extends Document  {
    email               :   string,
    password            :   string,
    firstname           :   string,
    lastname            :   string,
    username            :   string,
    avatar              :   string,  /** Link to avatar */
    lastConnection      :   Array<number>, // array
    LastDeconnection    :   Array<number>,
    historiqueEdition   :   Array<string>,
    collaborations      :   Array<string>,
    ownership           :   Array<string>,
    teams               :   Array<string>,
    totalTimeCollab     :   number,
    isNamePublic        :   boolean,
    isEmailPublic       :   boolean,
    lastAction          :   Array<IAction>
}
