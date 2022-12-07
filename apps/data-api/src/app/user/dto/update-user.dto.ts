import { ILocation } from 'shared/domain';

export class UpdateUserDto {
    location?: ILocation;
    profileDescription?: string;
}
