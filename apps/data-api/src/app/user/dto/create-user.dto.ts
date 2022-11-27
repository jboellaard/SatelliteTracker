import { LocationCoordinates } from 'shared/domain';

export class CreateUserDto {
  username: string;
  emailAddress: string;
  location: LocationCoordinates;
  profileDescription: string;
  roles: string[];

  constructor(
    username: string,
    emailAddress: string,
    location: LocationCoordinates,
    profileDescription = '',
    roles = ['user']
  ) {
    this.username = username;
    this.emailAddress = emailAddress;
    this.location = location;
    this.profileDescription = profileDescription;
    this.roles = roles;
  }
}
