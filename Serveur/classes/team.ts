export class Team {
    /** ajouter un Room constructor qui build a partir des donnees en database */
    constructor(
        private name: string,
        private owner: string,
        private bio: string,
        private users: Array<string>,
        private password: string,
        private maxUsers: number) {

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
    }

    public hasUser(user: string) : boolean {
        return this.users.includes(user);
    }

    public getName(): string {
        return this.name;
    }

    public getOwner(): string{
        return this.owner;
    }

    public setOwner(owner: string) {
        this.owner = owner;
    }


    public getPassword(){
        return this.password;
    }

    public getMaxUsers(){
        return this.maxUsers;
    }

    public getBio() {
        return this.bio;
    }
}