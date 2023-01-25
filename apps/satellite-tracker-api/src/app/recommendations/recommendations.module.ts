import { Module } from '@nestjs/common';
import { RecommendationsService } from './recommendations.service';
import { RecommendationsController } from './recommendations.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Satellite, SatelliteSchema } from '../satellite/schemas/satellite.schema';
import { User, UserSchema } from '../user/schemas/user.schema';

@Module({
    imports: [
        MongooseModule.forFeature(
            [
                { name: User.name, schema: UserSchema },
                { name: Satellite.name, schema: SatelliteSchema },
            ],
            'satellitetrackerdb'
        ),
    ],
    controllers: [RecommendationsController],
    providers: [RecommendationsService],
})
export class RecommendationsModule {}
