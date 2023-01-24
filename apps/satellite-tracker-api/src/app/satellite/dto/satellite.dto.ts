import { PartialType } from '@nestjs/mapped-types';
import { ICustomSatellitePart, Id, IOrbit, ISatellite, IUser, Shape } from 'shared/domain';

export class SatelliteDto implements ISatellite {
    satelliteName!: string;
    mass!: number;
    sizeOfBase!: number;
    colorOfBase!: string;
    shapeOfBase!: Shape;
    description?: string | undefined;
    purpose?: string | undefined;
    satelliteParts?: ICustomSatellitePart[] | undefined;
    orbit?: IOrbit | undefined;
    // launch?: ILaunch | undefined;
    createdBy?: Id;
    createdAt?: Date | undefined;
    updatedAt?: Date | undefined;
}

export class UpdateSatelliteDto extends PartialType(SatelliteDto) {
    override createdBy!: Id;
    override satelliteName?: string;
    override mass?: number;
    override sizeOfBase?: number;
    override colorOfBase?: string;
}
