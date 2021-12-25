import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class UserService {

    // Logged in user
    private currentUser: any = { name: 'lmao111', tokenId: ''};

    constructor() {
    }

    setCurrentUser(userName: string, userToken: string): void {
        this.currentUser.name = userName;
        this.currentUser.tokenId = userToken;
    }

    getCurrentUser(): any {
        return this.currentUser;
    }

    setCurrentUsername(userName: string): void {
        this.currentUser.name = userName;
    }

    getCurrentUsername(): any {
        return this.currentUser.name;
    }

    getCurrentUserToken(): any {
        return this.currentUser.tokenId;
    }

}
