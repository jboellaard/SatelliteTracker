import { Id } from './id.type';
import { ISatellite } from './satellite.interface';

export interface IUserInfo {
    id?: Id;
    username: string;
    location?: ILocation;
    profileDescription?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IUser extends IUserInfo {
    satellites?: ISatellite[];
}

export interface ILocation {
    coordinates?: {
        longitude: number;
        latitude: number;
    };
}
