import { ILocation } from 'shared/domain';
import { PointCoordinates } from '../schemas/user.schema';

export class UpdateUserDto {
    location?: PointCoordinates;
    profileDescription?: string;
}
