import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Identity, IdentitySchema } from '../auth/schemas/identity.schema';
import { Satellite, SatelliteSchema, SatellitePart, SatellitePartSchema } from '../satellite/schemas/satellite.schema';
import { User, UserSchema } from '../user/schemas/user.schema';
import { DbseedService } from './dbseed.service';

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
        MongooseModule.forFeature([{ name: Identity.name, schema: IdentitySchema }], 'identitydb'),
    ],
    providers: [DbseedService],
})
export class DbseedModule {}
