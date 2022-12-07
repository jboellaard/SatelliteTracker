import { IUserInfo } from './user.interface';

export interface UserCredentials {
    username: string;
    password: string;
}

export interface UserRegistration extends UserCredentials {
    emailAddress: string;
    profileInfo?: IUserInfo;
}

export interface Token {
    token: string;
}
