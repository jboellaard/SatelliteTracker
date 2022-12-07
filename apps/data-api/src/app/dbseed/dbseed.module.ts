import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Identity, IdentitySchema } from '../auth/schemas/identity.schema';
import { Neo4jModule } from '../neo4j/neo4j.module';
import { Neo4jService } from '../neo4j/neo4j.service';
import { Satellite, SatelliteSchema, SatellitePart, SatellitePartSchema } from '../satellite/satellite.schema';
import { User, UserSchema } from '../user/user.schema';
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
