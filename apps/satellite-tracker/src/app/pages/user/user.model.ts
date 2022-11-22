export class GeographicLocation {
  longitude: number;
  latitude: number;

  constructor(_longitude: number = 0, _latitude: number = 0) {
    this.longitude = _longitude;
    this.latitude = _latitude;
  }
}

export class User {
  id: number | undefined;
  username: string;
  profiledescription: string;
  email: string;
  password: string;
  location: GeographicLocation = new GeographicLocation();
  createdAt: Date;
  updatedAt: Date;

  constructor(
    id: number | undefined = undefined,
    username: string = '',
    profiledescription: string = '',
    email: string = '',
    password: string = '',
    createdAt: Date = new Date(),
    updatedAt: Date = new Date(),
    location = new GeographicLocation()
  ) {
    this.id = id;
    this.username = username;
    this.profiledescription = profiledescription;
    this.email = email;
    this.password = password;
    this.location = location;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}
