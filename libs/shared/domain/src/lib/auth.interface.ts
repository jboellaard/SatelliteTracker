import { Id } from './id.type';
import { IUserInfo } from './user.interface';

export interface UserCredentials {
    username: string;
    password: string;
}

export interface UserRegistration extends UserCredentials {
    _id?: Id;
    id?: Id;
    emailAddress?: string;
    roles?: string[];
    profileInfo?: IUserInfo;
}

export interface UserIdentity {
    _id?: Id;
    id?: Id;
    username?: string;
    emailAddress?: string;
    roles?: string[];
}

// export interface IIdentity {
//     id?: Id;
//     username?: string;
//     emailAddress?: string;
//     roles?: string[];
// }

export interface Token {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    username: string;
    roles: string[];
}
