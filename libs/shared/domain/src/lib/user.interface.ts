import { Id } from './id.type';
import { Satellite } from './satellite.interface';

export interface UserIdentity {
  id: Id;
  username: string;
}

export interface UserInfo extends UserIdentity {
  createdAt: Date;
  emailAddress: string;
  location: LocationCoordinates;
  profileDescription: string;
  roles: string[];
}

export interface User extends UserInfo {
  satellites?: Satellite[];
}

export interface LocationCoordinates {
  longitude: number;
  latitude: number;
}
