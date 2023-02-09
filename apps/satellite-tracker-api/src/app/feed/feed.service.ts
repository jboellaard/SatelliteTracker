import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FeedItem, FeedItemType } from 'shared/domain';
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
    constructor(
        @InjectModel(Satellite.name, `${process.env.MONGO_DATABASE}`) private satelliteModel: Model<SatelliteDocument>,
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
        // satellites = satellites.filter((satellite) => satellite.createdBy !== username);
        const users = await this.userModel
            .find({ username: { $in: satellites.map((satellite) => satellite.createdBy) } })
            .exec();
        satellites.forEach((satellite) => {
            const user = users.find((user) => user.username == satellite.createdBy);
            satellite.createdBy = user._id;
        });

        let query = { $or: [] };
        satellites.forEach((currentSatellite) => {
            query.$or.push({
                $and: [{ createdBy: currentSatellite.createdBy }, { satelliteName: currentSatellite.satelliteName }],
            });
        });
        const allSatellites = (await this.satelliteModel.find(query).populate('createdBy', 'username').exec()) as any[];

        let mostRecentActivity: FeedItem[] = [];
        allSatellites.forEach((satellite) => {
            const satelliteFeedItem = {
                satelliteName: satellite.satelliteName,
                satelliteId: satellite._id,
                username: satellite.createdBy.username,
                date: satellite.updatedAt,
                changed: 'satellite',
            };
            if (satellite.updatedAt > satellite.createdAt) {
                mostRecentActivity.push({
                    ...satelliteFeedItem,
                    type: FeedItemType.updated,
                });
            } else {
                mostRecentActivity.push({
                    ...satelliteFeedItem,
                    type: FeedItemType.created,
                });
            }
            if (satellite.orbit) {
                let orbitFeedItem = {
                    satelliteName: satellite.satelliteName,
                    satelliteId: satellite._id,
                    username: satellite.createdBy.username,
                    date: satellite.orbit.updatedAt,
                    changed: 'orbit',
                };
                if (satellite.orbit.updatedAt > satellite.orbit.createdAt) {
                    mostRecentActivity.push({
                        ...orbitFeedItem,
                        type: FeedItemType.updated,
                    });
                } else {
                    mostRecentActivity.push({
                        ...orbitFeedItem,
                        type: FeedItemType.created,
                    });
                }
            }
        });

        mostRecentActivity = mostRecentActivity.sort((a, b) => {
            return new Date(b.date).getTime() - new Date(a.date).getTime();
        });

        return { status: HttpStatus.OK, result: mostRecentActivity };
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
                username: record.get('user').properties.username,
                satelliteName: record.get('satellite').properties.satelliteName,
                satelliteId: undefined,
                createdBy: record.get('satellite').properties.createdBy,
                date: record.get('track').properties.since.toString(),
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
                    username: record.get('user').properties.username,
                    satelliteName: record.get('satellite').properties.satelliteName,
                    satelliteId: undefined,
                    createdBy: record.get('satellite').properties.createdBy,
                    date: record.get('create').properties.createdAt.toString(),
                    type: FeedItemType.created,
                };
            })
        );

        for (let i = 0; i < satellites.length; i++) {
            const user = await this.userModel.findOne({ username: satellites[i].createdBy });
            const satellite = await this.satelliteModel.findOne({
                satelliteName: satellites[i].satelliteName,
                createdBy: user._id,
            });
            satellites[i].satelliteId = satellite._id;
        }

        const mostRecentlyFollowed = await this.neo4jService.read(UserNeoQueries.getMostRecentlyFollowed, {
            list: usersFollowing.records.map((record) => record.get('user').properties.username),
            skip: 0,
            limit: 10,
        });
        let users = mostRecentlyFollowed.records.map((record) => {
            return {
                username: record.get('user').properties.username,
                followed: record.get('followed').properties.username,
                date: record.get('follow').properties.since.toString(),
                type: FeedItemType.followed,
            };
        });

        const feed = [...satellites, ...users]
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 10);
        return { status: HttpStatus.OK, result: feed };
    }

    async getMostRecentSatellitesFeed(username: string) {
        const trackedSatellites = await this.neo4jService.read(SatelliteNeoQueries.getTrackedSatellites, { username });
        let satellites = trackedSatellites.records.map((record) => {
            return {
                satelliteName: record.get('satellite').properties.satelliteName,
                createdBy: record.get('satellite').properties.createdBy,
            };
        });
        // satellites = satellites.filter((satellite) => satellite.createdBy !== username);
        const users = await this.userModel
            .find({ username: { $in: satellites.map((satellite) => satellite.createdBy) } })
            .exec();
        satellites.forEach((satellite) => {
            const user = users.find((user) => user.username == satellite.createdBy);
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
                    satelliteId: { $first: '$_id' },
                    satelliteName: { $first: '$satelliteName' },
                    // mass: { $first: '$mass' },
                    // sizeOfBase: { $first: '$sizeOfBase' },
                    // colorOfBase: { $first: '$colorOfBase' },
                    // shapeOfBase: { $first: '$shapeOfBase' },
                    // purpose: { $first: '$purpose' },
                    username: { $first: '$createdBy.username' },
                    // createdAt: { $first: '$createdAt' },
                    // updatedAt: { $first: '$updatedAt' },
                    orbit: { $first: '$orbit' },
                    // satelliteParts: { $push: '$satelliteParts' },
                    date: { $first: '$mostRecentChange' },
                    changed: { $first: '$changed' },
                },
            },
            { $sort: { date: -1 } },
        ]);

        mostRecentlyUpdatedSatellites.forEach((item) => {
            if (
                (item.createdAt == item.date && item.changed == 'satellite') ||
                (item.changed == 'orbit' && item.orbit.createdAt == item.date)
            ) {
                item.type = 'created';
            } else {
                item.type = 'updated';
            }
        });

        return { status: HttpStatus.OK, result: mostRecentlyUpdatedSatellites };
    }
}
