import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Neo4jService } from '../neo4j/neo4j.service';
import { User, UserDocument } from '../user/schemas/user.schema';
import { RecommendationsNeoQueries } from './neo4j/recommendations.cypher';

@Injectable()
export class RecommendationsService {
    constructor(
        private readonly neo4jService: Neo4jService,
        @InjectModel(User.name, 'satellitetrackerdb') private userModel: Model<UserDocument>,
        @InjectConnection('satellitetrackerdb') private stconnection: mongoose.Connection
    ) {}

    async getSimilarCreators(username: string) {
        const similarCreators = await this.neo4jService.read(RecommendationsNeoQueries.getSimilarCreators, {
            username,
        });

        const users = await this.userModel
            .find({ username: { $in: similarCreators.records.map((record) => record.get('username')) } })
            .exec();
        return { status: HttpStatus.OK, result: users };
    }

    async getFollowRecommendations(username: string) {
        const followRecommendations = await this.neo4jService.read(RecommendationsNeoQueries.getRecommendedUsers, {
            username,
            depth: 4,
        });

        const users = await this.userModel
            .find({ username: { $in: followRecommendations.records.map((record) => record.get('username')) } })
            .exec();
        return { status: HttpStatus.OK, result: users };
    }
}
