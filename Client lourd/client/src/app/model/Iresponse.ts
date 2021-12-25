export interface IResponse {
    title: string;
    token: string;
    username: string;
    avatar: string;
}

export enum Status {
    HTTP_OK = 200,
    HTTP_CREATED = 201,
    HTTTP_UNAUTHORIZED = 401,
    HTTP_NOT_FOUND = 404,
    EMAIL_ALREADY_EXISTS = 601,
    USERNAME_ALREADY_EXISTS = 602,
    USER_ALREADY_CONNECTED = 603,
    PASSWORD_NOT_PROVIDED = 702,
    EMAIL_NOT_FOUND = 901,
    WRONG_PASSWORD = 902
}

export enum Title {
    AUTHORIZED = 'Authorized',
    UNAUTHORIZED = 'Unauthorized'
}