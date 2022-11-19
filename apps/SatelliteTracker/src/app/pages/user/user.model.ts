export class GeographicLocation {
  longitude: number = 0;
  latitude: number = 0;

  constructor(longitude: number, latitude: number) {
    this.longitude = longitude;
    this.latitude = latitude;
  }
}

export class User {
  id: number | undefined;
  name: string | undefined;
  email: string | undefined;
  location: GeographicLocation = new GeographicLocation(0, 0);
  createdAt: Date | undefined;
  updatedAt: Date | undefined;

  constructor(
    id: number | undefined = undefined,
    name: string = '',
    email: string = '',
    createdAt: Date = new Date(),
    updatedAt: Date = new Date(),
    location = new GeographicLocation(0, 0)
  ) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.location = location;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}
