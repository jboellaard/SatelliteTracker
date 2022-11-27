export class CreateSatelliteDto {
  name: string;
  mass: number;
  radiusOfBase: number;
  radiusOfParts: number;
  createdBy: number;

  constructor(name: string, mass: number, radiusOfBase: number, radiusOfParts: number, createdBy: number) {
    this.name = name;
    this.mass = mass;
    this.radiusOfBase = radiusOfBase;
    this.radiusOfParts = radiusOfParts;
    this.createdBy = createdBy;
  }
}
