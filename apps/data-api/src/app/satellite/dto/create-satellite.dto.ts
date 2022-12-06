import { Id } from 'shared/domain';

export class CreateSatelliteDto {
    name: string;
    mass: number;
    radiusOfBase: number;
    radiusOfParts: number;
    colorOfBase: string;
    purpose: string;

    createdBy: Id;

    constructor(
        name: string,
        mass: number,
        radiusOfBase: number,
        radiusOfParts: number,
        createdBy: Id,
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
