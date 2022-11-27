import { PartialType } from '@nestjs/mapped-types';
import { CreateSatelliteDto } from './create-satellite.dto';

export class UpdateSatelliteDto extends PartialType(CreateSatelliteDto) {}
