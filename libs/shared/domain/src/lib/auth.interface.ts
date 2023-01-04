import { Id } from './id.type';
import { IUserInfo } from './user.interface';

export interface UserCredentials {
    username: string;
    password: string;
}

export interface UserIdentity extends UserCredentials {
    id?: Id;
    emailAddress?: string;
    roles?: string[];
    profileInfo?: IUserInfo;
}

export interface Token {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    username: string;
    roles: string[];
}
