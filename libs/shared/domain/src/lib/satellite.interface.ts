import { Id } from './id.type';
import { IUser } from './user.interface';

export const Purpose = [
    'TBD',
    'Research',
    'Communication',
    'Navigation',
    'Weather forecasting',
    'Mapping',
    'Experimentation',
    'Space cleanup',
];

export enum Shape {
    Sphere = 'Sphere',
    Cube = 'Cube',
}

export interface ISatellitePart {
    _id?: Id;
    id?: Id;
    partName: string;
    description?: string;
    function?: string;
    material?: string;
    dependsOn?: ISatellitePart[];
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
    argumentOfPerigee?: number; // argument of latitude if e==0 and true latitude if e==0 and i==0
    period?: number;
    dateTimeOfLaunch?: Date;
    createdAt?: Date;
    updatedAt?: Date;
}

// export interface ILaunch {
//     launchDate: Date;
//     launchSite?: ILocation;
//     succeeded?: boolean;
//     createdAt?: Date;
//     updatedAt?: Date;
// }

export interface ISatellite {
    _id?: Id;
    id?: Id;
    satelliteName: string;
    description?: string;
    mass: number;
    sizeOfBase: number;
    colorOfBase: string;
    shapeOfBase: Shape;
    purpose?: string;
    satelliteParts?: ICustomSatellitePart[];
    orbit?: IOrbit;
    // launch?: ILaunch;

    createdById?: Id;
    createdBy?: IUser;
    createdAt?: Date;
    updatedAt?: Date;
}
