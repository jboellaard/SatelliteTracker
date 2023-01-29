import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FeedItemType } from 'shared/domain';
import { moveMessagePortToContext } from 'worker_threads';
import { Neo4jService } from '../neo4j/neo4j.service';
import { SatelliteNeoQueries } from '../satellite/neo4j/satellite.cypher';
import {
    Satellite,
    SatelliteDocument,
    SatellitePart,
    SatellitePartDocument,
} from '../satellite/schemas/satellite.schema';
import { UserNeoQueries } from '../user/neo4j/user.cypher';
import { User, UserDocument } from '../user/schemas/user.schema';

@Injectable()
export class FeedService {
    // following: most recently followed and created
    // tracking: most recently updated

    constructor(
        @InjectModel(Satellite.name, `${process.env.MONGO_DATABASE}`) private satelliteModel: Model<SatelliteDocument>,
        @InjectModel(SatellitePart.name, `${process.env.MONGO_DATABASE}`)
        private satellitePartModel: Model<SatellitePartDocument>,
        @InjectModel(User.name, `${process.env.MONGO_DATABASE}`) private userModel: Model<UserDocument>,
        private readonly neo4jService: Neo4jService
    ) {}

    async getSatellitesFeed(username: string) {
        const trackedSatellites = await this.neo4jService.read(SatelliteNeoQueries.getTrackedSatellites, { username });
        let satellites = trackedSatellites.records.map((record) => {
            return {
                satelliteName: record.get('satellite').properties.satelliteName,
                createdBy: record.get('satellite').properties.createdBy,
            };
        });
        satellites = satellites.filter((satellite) => satellite.createdBy !== username);
        const users = await this.userModel
            .find({ username: { $in: satellites.map((satellite) => satellite.createdBy) } })
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
        const mostRecentlyUpdatedSatellites = await this.satelliteModel.aggregate([
            { $match: query },
            { $unwind: { path: '$orbit', preserveNullAndEmptyArrays: true } },
            {
                $addFields: {
                    mostRecentChange: { $max: ['$updatedAt', '$orbit.updatedAt'] },
                    changed: {
                        $cond: [
                            {
                                $or: [
                                    { $gt: ['$updatedAt', '$orbit.updatedAt'] },
                                    { $eq: [{ $ifNull: ['$orbit', 0] }, 0] },
                                ],
                            },
                            'satellite',
                            'orbit',
                        ],
                    },
                },
            },
            { $sort: { mostRecentChange: -1 } },
            { $skip: 0 },
            { $limit: 10 },
            {
                $lookup: {
                    from: 'users',
                    let: { createdBy: '$createdBy' },
                    pipeline: [
                        { $match: { $expr: { $eq: ['$_id', '$$createdBy'] } } },
                        { $project: { _id: 1, username: 1 } },
                    ],
                    as: 'createdBy',
                },
            },
            // { $unwind: { path: '$satelliteParts', preserveNullAndEmptyArrays: true } },
            // {
            //     $lookup: {
            //         from: 'satelliteparts',
            //         let: { satellitePartId: '$satelliteParts.satellitePart' },
            //         pipeline: [
            //             { $match: { $expr: { $eq: ['$_id', '$$satellitePartId'] } } },
            //             { $project: { _id: 1, partName: 1, description: 1, function: 1, dependsOn: 1 } },
            //         ],
            //         as: 'satelliteParts.satellitePart',
            //     },
            // },
            // { $unwind: { path: '$satelliteParts.satellitePart', preserveNullAndEmptyArrays: true } },
            {
                $group: {
                    _id: '$_id',
                    satelliteName: { $first: '$satelliteName' },
                    mass: { $first: '$mass' },
                    sizeOfBase: { $first: '$sizeOfBase' },
                    colorOfBase: { $first: '$colorOfBase' },
                    shapeOfBase: { $first: '$shapeOfBase' },
                    purpose: { $first: '$purpose' },
                    createdBy: { $first: '$createdBy' },
                    createdAt: { $first: '$createdAt' },
                    updatedAt: { $first: '$updatedAt' },
                    orbit: { $first: '$orbit' },
                    // satelliteParts: { $push: '$satelliteParts' },
                    mostRecentChange: { $first: '$mostRecentChange' },
                    changed: { $first: '$changed' },
                },
            },
            { $sort: { mostRecentChange: -1 } },
        ]);

        mostRecentlyUpdatedSatellites.forEach((satellite) => {
            if (satellite.createdAt == satellite.mostRecentChange) {
                satellite.type = 'created';
            } else {
                satellite.type = 'updated';
            }
        });

        return { status: HttpStatus.OK, result: mostRecentlyUpdatedSatellites };
    }

    async getFollowingFeed(username: string) {
        const usersFollowing = await this.neo4jService.read(UserNeoQueries.getFollowing, { username });

        const mostRecentlyTracked = await this.neo4jService.read(SatelliteNeoQueries.getMostRecentlyTracked, {
            list: usersFollowing.records.map((record) => record.get('user').properties.username),
            skip: 0,
            limit: 10,
        });
        let satellites = mostRecentlyTracked.records.map((record) => {
            return {
                user: record.get('user').properties.username,
                satelliteName: record.get('satellite').properties.satelliteName,
                createdBy: record.get('satellite').properties.createdBy,
                since: record.get('track').properties.since.toString(),
                type: FeedItemType.tracked,
            };
        });

        const mostRecentlyCreated = await this.neo4jService.read(SatelliteNeoQueries.getMostRecentlyCreated, {
            list: usersFollowing.records.map((record) => record.get('user').properties.username),
            skip: 0,
            limit: 10,
        });
        satellites = satellites.concat(
            mostRecentlyCreated.records.map((record) => {
                return {
                    user: record.get('user').properties.username,
                    satelliteName: record.get('satellite').properties.satelliteName,
                    createdBy: record.get('satellite').properties.createdBy,
                    since: record.get('create').properties.since.toString(),
                    type: FeedItemType.created,
                };
            })
        );

        const mostRecentlyFollowed = await this.neo4jService.read(UserNeoQueries.getMostRecentlyFollowed, {
            list: usersFollowing.records.map((record) => record.get('user').properties.username),
            skip: 0,
            limit: 10,
        });
        let users = mostRecentlyFollowed.records.map((record) => {
            return {
                user: record.get('user').properties.username,
                followed: record.get('followed').properties.username,
                since: record.get('follow').properties.since.toString(),
                type: FeedItemType.followed,
            };
        });

        const feed = [...satellites, ...users]
            .sort((a, b) => new Date(b.since).getTime() - new Date(a.since).getTime())
            .slice(0, 10);
        return { status: HttpStatus.OK, result: feed };
    }
}
