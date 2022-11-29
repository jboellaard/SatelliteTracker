export class CreateSatelliteDto {
  name: string;
  mass: number;
  radiusOfBase: number;
  radiusOfParts: number;
  colorOfBase: string;
  purpose: string;

  createdBy: number;

  constructor(
    name: string,
    mass: number,
    radiusOfBase: number,
    radiusOfParts: number,
    createdBy: number,
    colorOfBase: string,
    purpose: string
  ) {
    this.name = name;
    this.mass = mass;
    this.radiusOfBase = radiusOfBase;
    this.radiusOfParts = radiusOfParts;
    this.createdBy = createdBy;
    this.colorOfBase = colorOfBase;
    this.purpose = purpose;
  }
}
