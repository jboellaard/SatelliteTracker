import { Id } from './id.type';
import { ISatellite } from './satellite.interface';

export interface IUserInfo {
    _id?: Id;
    id?: Id;
    username: string;
    location?: ILocation;
    profileDescription?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IUser extends IUserInfo {
    satellites?: ISatellite[];
    followers?: IUserInfo[];
    following?: IUserInfo[];
    followerCount?: number;
}

export interface AdminUserInfo extends IUserInfo {
    emailAddress: string;
    roles: string[];
}

export interface ILocation {
    coordinates?: {
        longitude: number;
        latitude: number;
    };
}
