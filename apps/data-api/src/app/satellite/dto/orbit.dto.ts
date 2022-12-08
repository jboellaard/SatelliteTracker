import { PartialType } from '@nestjs/mapped-types';
import { IOrbit } from 'shared/domain';

export class OrbitDto implements IOrbit {
    semiMajorAxis!: number;
    eccentricity?: number;
    inclination?: number;
    longitudeOfAscendingNode?: number;
    argumentOfPerigee?: number;
    period?: number;
    dateTimeOfLaunch?: Date;
    createdAt?: Date;
    updatedAt?: Date;
}

export class UpdateOrbitDto extends PartialType(OrbitDto) {
    override semiMajorAxis?: number;
}
