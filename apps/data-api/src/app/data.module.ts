import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { UserService } from './user/user.service';
import { User, UserSchema } from './user/user.schema';
import { UserController } from './user/user.controller';
import { Satellite, SatellitePart, SatellitePartSchema, SatelliteSchema } from './satellite/satellite.schema';
import { SatelliteController } from './satellite/satellite.controller';
import { SatelliteService } from './satellite/satellite.service';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: User.name, schema: UserSchema },
            { name: Satellite.name, schema: SatelliteSchema },
            { name: SatellitePart.name, schema: SatellitePartSchema },
        ]),
    ],
    controllers: [SatelliteController, UserController],
    providers: [UserService, SatelliteService],
})
export class DataModule {}
