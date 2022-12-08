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
    partName: string;
    description?: string;
    function?: string;
    material?: string;
}

export interface ICustomSatellitePart {
    satellitePart: ISatellitePart;
    size?: number;
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
    dateTimeOfLaunch?: Date;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface ILaunch {
    launchDate: Date;
    launchSite?: ILocation;
    succeeded?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface ISatellite {
    id?: Id;
    satelliteName: string;
    description?: string;
    mass: number;
    sizeOfBase: number;
    colorOfBase: string;
    purpose?: string;
    satelliteParts?: ICustomSatellitePart[];
    orbit?: IOrbit;
    // launch?: ILaunch;

    createdById?: Id;
    createdBy?: IUser;
    createdAt?: Date;
    updatedAt?: Date;
}
