import { User } from "../classes/user";
import logging from "../config/logging";
import { IUser } from "../interfaces/user";
import DatabaseService from "./databaseService";


export const status = {
    CONNECTED: "connected",
    DISCONNECTED: "disconnected",
    BUSY: "busy"
}

export const action = {
    LOGIN: "login",
    LOGOUT: "logout",
    JOIN_DRAWING: "join_drawing",
    LEAVE_DRAWING: "leave_drawing"
}

class UserService {

    /** socketID -> User */
    private socketID_users =  new Map<string, string>();

    /** User -> SocketID */
    private users_socketID =  new Map<string, string>();
    
    /** User -> Data */
    private userData =  new Map<string, User>();

    /** User -> Status */
    private userStatus = new Map<string, string>();

    private NAMESPACE = "USER"
    
    constructor() {
        DatabaseService.getAllUsers().then((ans: Array<IUser>) => {
            ans.forEach((user: IUser) => {
                let user_instance: User = this.createUserFromIUser(user);
                this.userData.set(user.username, user_instance)
                this.userStatus.set(user.username, status.DISCONNECTED)
            })
        }).catch((error) => {
            logging.error(this.NAMESPACE, error.message);
        });

    }

    public createUserFromIUser(user: IUser) {
        return new User
        (
            user.email,
            user.password,
            user.firstname,
            user.lastname,
            user.username,
            user.avatar,
            user.lastConnection,
            user.LastDeconnection,
            user.historiqueEdition,
            user.collaborations,
            user.ownership,
            user.teams,
            user.totalTimeCollab,
            user.isNamePublic,
            user.isEmailPublic,
            user.lastAction
        )
    }

    public IsUserConnected(username: string): boolean {
        return this.userStatus.get(username) == status.CONNECTED || this.userStatus.get(username) == status.BUSY;
    }

    public getUserStatus(): Map<string, string> {
        return this.userStatus
    }

    public setUserStatus(user: string, status: string){
        this.userStatus.set(user, status);
    }
    
    public connectUser(user : string): void {
        this.userStatus.set(user, status.CONNECTED);
    }

    public disconnectUser(user : string): void {
        this.userStatus.set(user, status.DISCONNECTED);
    }

    public busyUser(user : string): void {
        this.userStatus.set(user, status.BUSY);
    }

    public SetSocket(SocketID: string, user: string): void {
        this.socketID_users.set(SocketID, user);
        this.users_socketID.set(user, SocketID);
    }

    public deleteSocket(SocketID: string, user: string): void {
        this.socketID_users.delete(SocketID);
        this.users_socketID.delete(user);
    }

    public getUserFromSocketID(SocketID: string): string | undefined {
        return this.socketID_users.get(SocketID);
    }

    public getSocketIDFromUser(user: string): string | undefined {
        return this.users_socketID.get(user);
    }

    public getUsers(): Map<String, User> {
        return this.userData;
    }

}

const userService = new UserService();

export default userService;