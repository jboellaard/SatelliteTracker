import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { SatelliteService } from '../satellite/satellite.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './user.schema';

@Module({
    imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }], 'satellitetrackerdb')],
    controllers: [UserController],
    providers: [UserService, SatelliteService],
})
export class UserModule {}
