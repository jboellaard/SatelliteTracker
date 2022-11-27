import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  override username?: string;
  override profileDescription?: string;
  override emailAddress?: string;
  override location?: {
    latitude: number;
    longitude: number;
  };
}
