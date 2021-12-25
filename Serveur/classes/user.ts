import { IAction } from "../interfaces/IAction";

export class User {

    private drawingJoinedTimeStamp = 0;
    constructor(
        private email                   : string,
        private password                : string,
        private firstname               : string,
        private lastname                : string,
        private username                : string,
        private avatar                  : string,
        private lastConnection          : Array<number>,
        private LastDeconnection        : Array<number>,
        private historiqueEdition       : Array<string>,
        private collaborations          : Array<string>,
        private ownership               : Array<string>,
        private teams                   : Array<string>,
        private totalTimeCollab         : number,
        private isNamePublic            : boolean,
        private isEmailPublic           : boolean,
        private lastAction              : Array<IAction>
    ){


     }

    public getEmail() {
        return this.email;
    }

    public getPassword() {
        return this.password
    }

    public getFirstname() {
        return this.firstname;
    }

    public getLastname() {
        return this.lastname
    }

    public getUsername() {
        return this.username;
    }

    public getAvatar() {
        return this.avatar;
    }

    public getLastConnection() {
        return this.lastConnection
    }

    public getLastDeconnection() {
        return this.LastDeconnection;
    }

    public getHistoriqueEdition() {
        return this.historiqueEdition;
    }

    public getCollaborations() {
        return this.collaborations
    }

    public getOwnership() {
        return this.ownership;
    }

    public getTotalTimeCollab() {
        return this.totalTimeCollab;
    }

    public getTeams() {
        return this.teams;
    }

    public getIsNamePublic() {
        return this.isNamePublic;
    }

    public getIsEmailPublic() {
        return this.isEmailPublic;
    }

    public getLastAction() {
        return this.lastAction;
    }
    

    public setEmail(email: string) {
        this.email = email;
    }

    public setPassword(password: string) {
        this.password = password;
    }

    public setFirstname(firstname : string) {
        return this.firstname = firstname;
    }

    public setLastname(lastname: string) {
        return this.lastname = lastname;
    }

    public setUsername(username: string) {
        this.username = username;
    }

    public setAvatar(avatar: string) {
        this.avatar = avatar;
    }

    public setLastConnection(date: number) {
        this.lastConnection.push(date);
    }

    public setLastDeconnection(date: number) {
        this.LastDeconnection.push(date);
    }

    public setHistoriqueEdition(drawing: string) {
        this.historiqueEdition.push(drawing);
    }

    public setCollaborations(collab: string) {
        if(!this.collaborations.includes(collab))
            this.collaborations.push(collab);
    }

    public addOwnership(ownership : string) {
        this.ownership.push(ownership);
    }

    public removeOwnership(ownership : string) {
        const index = this.ownership.indexOf(ownership)
        if (index > -1) {
            this.ownership.splice(index, 1);
        }
    }

    public addTotalTimeCollab(time: number) {
        this.totalTimeCollab += time;
    }

    public addTeam(teamName: string) {
        if (!this.teams.includes(teamName)) {
            this.teams.push(teamName);
        }
    }
    
    public removeTeam(teamName: string) {
        const index = this.teams.indexOf(teamName);
        if (index > -1) {
            this.teams.splice(index, 1);
        }
    }

    public setIsNamePublic(isNamePublic: boolean) {
        this.isNamePublic = isNamePublic;
    }

    public setIsEmailPublic(isEmailPublic: boolean) {
        this.isEmailPublic = isEmailPublic;
    }    

    public setDrawingJoinedTimeStamp(timestamp: number) {
        this.drawingJoinedTimeStamp = timestamp;
    }

    public getDrawingJoinedTimeStamp(){
        return this.drawingJoinedTimeStamp;
    }

    public addLastAction(action: IAction) {
        this.lastAction.push(action);
    }
}