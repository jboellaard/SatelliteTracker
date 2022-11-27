import { UserInfo, LocationCoordinates } from 'shared/domain';
import { IEntity } from 'ui/entity';

// export class LocationCoordinates implements LocationCoordinates {
//   longitude: number;
//   latitude: number;

//   constructor(_longitude: number = 0, _latitude: number = 0) {
//     this.longitude = _longitude;
//     this.latitude = _latitude;
//   }
// }

export class User implements UserInfo, IEntity {
  id: number | undefined;
  username!: string;
  profileDescription!: string;
  emailAddress!: string;
  password?: string | undefined;
  location!: LocationCoordinates;
  roles: string[] = ['user'];
  createdAt!: Date;

  constructor(values = {}) {
    // Assign all values to this objects properties
    Object.assign(this, values);
  }
}
