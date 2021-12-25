import Document from 'mongoose'
import { IMessage } from './IMessage'

export interface IRoomDB extends Document  {
    name           :   string,
    owner          :   string,
    password       :   string,
    history        :   Array<IMessage>,
    users          :   Array<string>
}

export interface IRoom  {
    name           :   string,
    owner          :   string | undefined,
    password       :   string,
    history        :   Array<IMessage>,
    users          :   Array<string>,
    connectedUsers :   Array<string>
}
