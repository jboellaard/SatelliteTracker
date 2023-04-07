import { Module } from '@nestjs/common';
import { FeedService } from './feed.service';
import { FeedController } from './feed.controller';
import { Satellite, SatelliteSchema } from '../satellite/schemas/satellite.schema';
import { SatellitePart, SatellitePartSchema } from '../satellite/schemas/satellite-part.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../user/schemas/user.schema';

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
    controllers: [FeedController],
    providers: [FeedService],
})
export class FeedModule {}
