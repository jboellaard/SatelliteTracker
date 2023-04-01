import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { APIResult, FeedItem, FeedItemType } from 'shared/domain';
import { Neo4jService } from '../neo4j/neo4j.service';
import { SatelliteNeoQueries } from '../satellite/neo4j/satellite.cypher';
import { Satellite, SatelliteDocument } from '../satellite/schemas/satellite.schema';
import { UserNeoQueries } from '../user/neo4j/user.cypher';
import { User, UserDocument } from '../user/schemas/user.schema';

@Injectable()
export class FeedService {
    constructor(
        @InjectModel(Satellite.name, `${process.env.MONGO_DATABASE}`) private satelliteModel: Model<SatelliteDocument>,
        @InjectModel(User.name, `${process.env.MONGO_DATABASE}`) private userModel: Model<UserDocument>,
        private readonly neo4jService: Neo4jService
    ) {}

    async getSatellitesFeed(username: string, skip = 0, limit = 10): Promise<APIResult<FeedItem[]>> {
        const trackedSatellites = await this.neo4jService.read(SatelliteNeoQueries.getTrackedSatellites, { username });
        if (trackedSatellites.records.length === 0) {
            return { status: HttpStatus.OK, result: [] };
        }
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
            const feedItem = {
                satelliteName: satellite.satelliteName,
                satelliteId: satellite._id,
                username: satellite.createdBy.username,
            };
            mostRecentActivity.push({
                ...feedItem,
                date: satellite.createdAt,
                changed: 'satellite',
                type: FeedItemType.created,
            });
            if (
                (satellite.orbit && satellite.orbit.updatedAt.toString() != satellite.updatedAt.toString()) ||
                !satellite.orbit
            ) {
                if (satellite.updatedAt > satellite.createdAt) {
                    mostRecentActivity.push({
                        ...feedItem,
                        date: satellite.updatedAt,
                        changed: 'satellite',
                        type: FeedItemType.updated,
                    });
                }
            }
            if (satellite.orbit) {
                mostRecentActivity.push({
                    ...feedItem,
                    date: satellite.orbit.createdAt,
                    changed: 'orbit',
                    type: FeedItemType.created,
                });
                if (satellite.orbit.updatedAt > satellite.orbit.createdAt) {
                    mostRecentActivity.push({
                        ...feedItem,
                        date: satellite.orbit.updatedAt,
                        changed: 'orbit',
                        type: FeedItemType.updated,
                    });
                }
            }
        });

        mostRecentActivity = mostRecentActivity.sort((a, b) => {
            return new Date(b.date).getTime() - new Date(a.date).getTime();
        });

        return { status: HttpStatus.OK, result: mostRecentActivity.slice(skip, skip + limit) };
    }

    async getFollowingFeed(username: string): Promise<APIResult<FeedItem[]>> {
        const neoSession = this.neo4jService.getReadSession();
        const usersFollowing = await neoSession.run(UserNeoQueries.getFollowing, { username });
        const mostRecentlyTracked = await neoSession.run(SatelliteNeoQueries.getMostRecentlyTracked, {
            list: usersFollowing.records.map((record) => record.get('following').properties.username),
            skip: 0,
            limit: 10,
        });
        const mostRecentlyCreated = await neoSession.run(SatelliteNeoQueries.getMostRecentlyCreated, {
            list: usersFollowing.records.map((record) => record.get('following').properties.username),
            skip: 0,
            limit: 10,
        });
        const mostRecentlyFollowed = await neoSession.run(UserNeoQueries.getMostRecentlyFollowed, {
            list: usersFollowing.records.map((record) => record.get('following').properties.username),
            skip: 0,
            limit: 10,
        });
        neoSession.close();

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

        let users = mostRecentlyFollowed.records.map((record) => {
            return {
                username: record.get('user').properties.username,
                followed: record.get('followed').properties.username,
                date: record.get('follow').properties.since.toString(),
                type: FeedItemType.followed,
            };
        });

        let feed = [...satellites, ...users]
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 10);

        for (const element of feed as any) {
            if (element.satelliteName) {
                let user = await this.userModel.findOne({ username: element.createdBy }).exec();
                let satellite = await this.satelliteModel
                    .findOne({
                        satelliteName: element.satelliteName,
                        createdBy: user._id,
                    })
                    .exec();
                element.satelliteId = satellite._id;
            }
        }

        return { status: HttpStatus.OK, result: feed };
    }

    async getMostRecentSatellitesFeed(username: string): Promise<APIResult<FeedItem[]>> {
        const trackedSatellites = await this.neo4jService.read(SatelliteNeoQueries.getTrackedSatellites, { username });
        if (trackedSatellites.records.length == 0) {
            return { status: HttpStatus.OK, result: [] };
        }
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
        const mostRecentlyUpdatedSatellites = await this.satelliteModel
            .aggregate([
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
            ])
            .exec();

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
