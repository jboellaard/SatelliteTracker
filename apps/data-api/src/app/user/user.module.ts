import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { SatelliteService } from '../satellite/satellite.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './user.schema';
import { Satellite, SatellitePart, SatellitePartSchema, SatelliteSchema } from '../satellite/satellite.schema';

@Module({
    imports: [
        MongooseModule.forFeature(
            [
                { name: User.name, schema: UserSchema },
                { name: Satellite.name, schema: SatelliteSchema },
                { name: SatellitePart.name, schema: SatellitePartSchema },
            ],
            'satellitetrackerdb'
        ),
    ],
    controllers: [UserController],
    providers: [UserService, SatelliteService],
})
export class UserModule {}
