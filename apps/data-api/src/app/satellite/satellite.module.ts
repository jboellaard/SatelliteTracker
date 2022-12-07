import { Module } from '@nestjs/common';
import { SatelliteService } from './satellite.service';
import { SatelliteController } from './satellite.controller';
import { UserService } from '../user/user.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../user/user.schema';
import { Satellite, SatellitePart, SatellitePartSchema, SatelliteSchema } from './satellite.schema';

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
    controllers: [SatelliteController],
    providers: [SatelliteService, UserService],
})
export class SatelliteModule {}
