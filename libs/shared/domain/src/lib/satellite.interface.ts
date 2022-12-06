import { Id } from './id.type';
import { ILocation, IUser } from './user.interface';

export type Purpose =
    | 'Research'
    | 'Communication'
    | 'Navigation'
    | 'Weather forecasting'
    | 'Mapping'
    | 'Experimentation'
    | 'Space cleanup'
    | 'TBD';

export interface ISatellitePart {
    name?: string; // communication system (antenna, transponder, etc.), propulsion system (thruster, engine, etc.), solar panel, camera, telescope (lens), particle detector, thermal system?, shield?, battery?
    function?: string;
    material?: string;
    height?: number;
    color?: string;
    quantity?: number;
}

export interface IOrbit {
    semiMajorAxis: number;
    eccentricity?: number;
    inclination?: number;
    longitudeOfAscendingNode?: number;
    argumentOfPerigee?: number;
    period?: number;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface ILaunch {
    launchDate: Date;
    launchSite?: ILocation;
    succeeded?: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface ISatellite {
    id?: Id;
    name: string;
    mass: number;
    sizeOfBase: number;
    colorOfBase: string;
    purpose: string;
    satelliteParts?: ISatellitePart[];
    orbit?: IOrbit;
    launch?: ILaunch;

    createdById: Id;
    createdBy?: IUser;
    createdAt: Date;
    updatedAt: Date;
}
