import { IMessage } from "../interfaces/chat/IMessage";
import user from "../models/user";

export class Room {
    private connected_users: Array<string> = [];
    /** ajouter un Room constructor qui build a partir des donnees en database */
    constructor(private name: string, private owner: string, private history: Array<IMessage>, private users: Array<string>, private password: string | undefined) {
        /*if(owner) {
            this.users.push(owner);
        }*/
     }


    public getUsers(): Array<string>{
        return this.users;
    }

    public AddUser(user: string){
        this.users.push(user);
    }

    public deleteUser(user: string) : void {
        let index = this.users.indexOf(user);
        index !== -1 && this.users.splice(index, 1);
        this.disconnectUser(user)
    }

    public hasUser(user: string) : boolean {
        return this.users.includes(user);
    }

    public getName(): string {
        return this.name;
    }

    public getOwner(): string | undefined {
        return this.owner;
    }

    public setOwner(owner: string) {
        this.owner = owner;
    }

    public getHistory(): Array<IMessage> {
        return this.history;
    }

    public getPassword(){
        return this.password;
    }

    public pushMessage(message: IMessage) {
        this.history.push(message);
    }

    public getConnectedUsers(): Array<string>{
        return this.connected_users;
    }

    public connectUser(user: string): void {
        if(!this.connected_users.includes(user)) {
            this.connected_users.push(user);
        }
    }

    public disconnectUser(user: string): void {
        let index = this.connected_users.indexOf(user);
        index !== -1 && this.connected_users.splice(index, 1);
    }
}