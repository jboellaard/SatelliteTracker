import { LocationCoordinates } from './user.interface';

export interface Satellite {
  id: string;
  name: string;
  orbit: Orbit;
}

export interface Orbit {
  type: string;
  semiMajorAxis: number;
}

export interface Launch {
  launchDate: Date;
  launchSite: LocationCoordinates;
}
