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

/**
 * @returns Gravitational constant in m^3 kg^-1 s^-2
 * */
export function getG() {
    return 6.6743 * Math.pow(10, -11);
}

/**
 * @returns Mass of the earth in kg
 */
export function getMassEarth() {
    return 5.9722 * Math.pow(10, 24);
}

/**
 * @param a - semi-major axis in meters
 * @returns Period in seconds
 * */
export function getPeriod(a: number) {
    return 2 * Math.PI * Math.sqrt(Math.pow(a, 3) / (getG() * getMassEarth()));
}

export interface ISatellite {
    _id?: Id;
    id?: Id;
    satelliteName: string;
    description?: string;
    mass: number;
    sizeOfBase: number;
    colorOfBase: string;
    shapeOfBase?: Shape;
    purpose?: string;
    satelliteParts?: ICustomSatellitePart[];
    orbit?: IOrbit;
    createdBy?: Id;
    createdAt?: Date;
    updatedAt?: Date;
    trackers?: IUser[];
    trackerCount?: number;
}
