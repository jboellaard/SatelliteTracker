import { LocationCoordinates } from 'shared/domain';

export class UpdateUserDto {
    location?: LocationCoordinates;
    profileDescription?: string;
}
