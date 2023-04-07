import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { SatelliteService } from '../satellite/satellite.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { Satellite, SatelliteSchema } from '../satellite/schemas/satellite.schema';
import { SatellitePart, SatellitePartSchema } from '../satellite/schemas/satellite-part.schema';

@Module({
    imports: [
        MongooseModule.forFeature(
            [
                { name: User.name, schema: UserSchema },
                { name: Satellite.name, schema: SatelliteSchema },
                { name: SatellitePart.name, schema: SatellitePartSchema },
            ],
            `${process.env.MONGO_DATABASE}`
        ),
    ],
    controllers: [UserController],
    providers: [UserService, SatelliteService],
})
export class UserModule {}
