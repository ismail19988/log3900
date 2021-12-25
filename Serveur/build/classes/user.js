"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
class User {
    constructor(username) {
        this.username = username;
    }
    getName() {
        return this.username;
    }
}
exports.User = User;
