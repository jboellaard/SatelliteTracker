import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { APIResult, ISatellite, IUser } from 'shared/domain';
import { Neo4jService } from '../neo4j/neo4j.service';
import { SatelliteDocument } from '../satellite/schemas/satellite.schema';
import { User, UserDocument } from '../user/schemas/user.schema';
import { RecommendationsNeoQueries } from './neo4j/recommendations.cypher';

@Injectable()
export class RecommendationsService {
    constructor(
        private readonly neo4jService: Neo4jService,
        @InjectModel(User.name, `${process.env.MONGO_DATABASE}`) private userModel: Model<UserDocument>,
        @InjectModel('Satellite', `${process.env.MONGO_DATABASE}`) private satelliteModel: Model<SatelliteDocument>
    ) {}
    // satellites visible at your location now?

    async getSimilarCreators(username: string): Promise<APIResult<IUser[]>> {
        const similarCreators = await this.neo4jService.read(RecommendationsNeoQueries.getSimilarCreators, {
            username,
            count: 2,
            skip: 0,
            limit: 10,
        });

        const users = await this.userModel
            .find({
                username: { $in: similarCreators.records.map((record) => record.get('creator').properties.username) },
            })
            .exec();
        return { status: HttpStatus.OK, result: users };
    }

    async getFollowRecommendations(username: string): Promise<APIResult<IUser[]>> {
        const followRecommendations = await this.neo4jService.read(RecommendationsNeoQueries.getRecommendedUsers, {
            username,
            skip: 0,
            limit: 10,
        });

        const users = await this.userModel
            .find({
                username: {
                    $in: followRecommendations.records.map((record) => record.get('user').properties.username),
                },
            })
            .exec();
        return { status: HttpStatus.OK, result: users };
    }

    async getSatelliteRecommendations(username: string): Promise<APIResult<ISatellite[]>> {
        let satelliteRecommendations = await this.neo4jService.read(
            RecommendationsNeoQueries.getRecommendSatellitesFromFollowing,
            {
                username,
                count: 0,
                skip: 0,
                limit: 10,
            }
        );
        let mappedSatellites = satelliteRecommendations.records.map((record) => {
            return {
                satelliteName: record.get('satellite').properties.satelliteName,
                createdBy: record.get('satellite').properties.createdBy,
            };
        });
        mappedSatellites = mappedSatellites.filter((satellite) => satellite.createdBy !== username);
        const satellites = await this.getSatelliteInformation(mappedSatellites);
        return { status: HttpStatus.OK, result: satellites };
    }

    async getPopularSatellites(): Promise<APIResult<ISatellite[]>> {
        const popularSatellites = await this.neo4jService.read(RecommendationsNeoQueries.getMostTrackedSatellites, {
            skip: 0,
            limit: 10,
        });
        let mappedSatellites = popularSatellites.records.map((record) => {
            return {
                satelliteName: record.get('satellite').properties.satelliteName,
                createdBy: record.get('satellite').properties.createdBy,
                trackerCount: record.get('trackers').toNumber(),
            };
        });

        let satellites = await this.getSatelliteInformation(mappedSatellites);
        satellites = satellites.filter((satellite) => satellite.trackerCount > 1);
        return { status: HttpStatus.OK, result: satellites };
    }

    private async getSatelliteInformation(satellites: any): Promise<ISatellite[]> {
        if (satellites.length === 0) return [];
        let users = await this.userModel
            .find({
                username: { $in: satellites.map((satellite) => satellite.createdBy) },
            })
            .exec();

        satellites.forEach((satellite) => {
            const user = users.find((user) => user.username === satellite.createdBy);
            satellite.createdBy = user._id;
        });

        let query = { $or: [] };
        satellites.forEach((currentSatellite) => {
            query.$or.push({
                $and: [{ createdBy: currentSatellite.createdBy }, { satelliteName: currentSatellite.satelliteName }],
            });
        });

        let satellitesWithInfo = await this.satelliteModel.find(query).populate('createdBy', 'username').exec();

        let finalSatellites = satellitesWithInfo.map((satellite) => {
            return {
                ...(satellite.toObject() as ISatellite),
                id: satellite._id.toString(),
                _id: undefined,
                createdBy: ((satellite.toObject() as ISatellite).createdBy as any).username,
                trackerCount: satellites.find((sat) => sat.satelliteName === satellite.satelliteName).trackerCount,
            };
        });

        return finalSatellites;
    }

    async getPopularCreators(): Promise<APIResult<IUser[]>> {
        const popularCreators = await this.neo4jService.read(RecommendationsNeoQueries.getMostFollowedUsers, {
            skip: 0,
            limit: 10,
        });
        let users = await this.userModel
            .find({
                username: { $in: popularCreators.records.map((record) => record.get('user').properties.username) },
            })
            .exec();

        let usersWithCount = users.map((user) => ({
            ...(user.toObject() as IUser),
            followerCount: popularCreators.records
                .find((record) => record.get('user').properties.username == user.username)
                .get('followers')
                .toNumber(),
        }));
        usersWithCount = usersWithCount.filter((user) => user.followerCount > 1);
        usersWithCount.sort((a, b) => b.followerCount - a.followerCount);

        return { status: HttpStatus.OK, result: usersWithCount };
    }

    async getRecentlyCreatedSatellites(): Promise<APIResult<ISatellite[]>> {
        const recentlyCreatedSatellites = await this.neo4jService.read(
            RecommendationsNeoQueries.getMostRecentlyCreatedSatellites,
            {
                skip: 0,
                limit: 10,
            }
        );
        let mappedSatellites = recentlyCreatedSatellites.records.map((record) => {
            return {
                satelliteName: record.get('satellite').properties.satelliteName,
                createdBy: record.get('satellite').properties.createdBy,
            };
        });

        const satellites = await this.getSatelliteInformation(mappedSatellites);
        return { status: HttpStatus.OK, result: satellites };
    }
}
