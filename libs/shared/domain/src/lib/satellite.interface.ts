import { Id } from './id.type';
import { LocationCoordinates, User } from './user.interface';

export interface Satellite {
  id: Id;
  name: string;
  mass: number;
  radiusOfBase: number;
  radiusOfParts: number;
  colorOfBase: string;
  purpose: string;
  orbit?: Orbit;

  createdBy: Id;
  createdAt: Date;
  lastUpdated: Date;
}

export interface Orbit {
  type: string;
  semiMajorAxis: number;
  eccentricity: number;
  inclination: number;
  period: number;
  createdAt: Date;
  lastUpdated: Date;
}

export interface Launch {
  launchDate: Date;
  launchSite: LocationCoordinates;
}
