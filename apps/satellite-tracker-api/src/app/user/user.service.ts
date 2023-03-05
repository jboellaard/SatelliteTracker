import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { APIResult, Id, ISatellite, IUser, IUserInfo } from 'shared/domain';
import { Neo4jService } from '../neo4j/neo4j.service';
import { SatelliteNeoQueries } from '../satellite/neo4j/satellite.cypher';
import { Satellite, SatelliteDocument } from '../satellite/schemas/satellite.schema';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserNeoQueries } from './neo4j/user.cypher';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UserService {
    private logger = new Logger(UserService.name);
    constructor(
        @InjectModel(User.name, `${process.env.MONGO_DATABASE}`) private userModel: Model<UserDocument>,
        @InjectModel(Satellite.name, `${process.env.MONGO_DATABASE}`) private satelliteModel: Model<SatelliteDocument>,
        private readonly neo4jService: Neo4jService
    ) {}

    async findAll(): Promise<APIResult<IUser[]>> {
        const users = await this.userModel.find();
        users.forEach((user) => {
            user.id = user._id.toString();
        });
        return { status: HttpStatus.OK, result: users };
    }

    private async getRelations(user: IUser): Promise<IUser> {
        const username = user.username;
        const neoSession = this.neo4jService.getReadSession();
        const followers = await neoSession.run(UserNeoQueries.getFollowers, { username }).then((result) => {
            return result.records.map((record) => record.get('follower').properties as IUserInfo);
        });
        const following = await neoSession.run(UserNeoQueries.getFollowing, { username }).then((result) => {
            return result.records.map((record) => record.get('following').properties as IUserInfo);
        });
        const tracking = await neoSession.run(SatelliteNeoQueries.getTrackedSatellites, { username }).then((result) => {
            return result.records.map((record) => {
                if (record.get('satellite').properties.launchDate) {
                    record.get('satellite').properties.launchDate = record
                        .get('satellite')
                        .properties.launchDate.toString();
                }
                return record.get('satellite').properties as { createdBy: string; satelliteName: string };
            });
        });
        tracking.forEach(async (satellite) => {
            const satelliteInfo = await this.satelliteModel
                .find({ satelliteName: satellite.satelliteName })
                .populate('createdBy', 'username');
            satelliteInfo.forEach((satellite) => {
                if ((satellite.createdBy as any).username == username) {
                    satellite.id = satellite._id.toString();
                }
            });
        });

        const userWithRelations = { ...user, followers, following, tracking };
        await neoSession.close();
        return userWithRelations;
    }

    async findOne(username: string): Promise<APIResult<IUser>> {
        const user = (
            await this.userModel.findOne({ username }).select('-location').populate('satellites')
        ).toObject() as IUser; // .populate('satellites.satelliteParts.satellitePart'))
        if (!user) {
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        }

        const userWithRelations = await this.getRelations(user);
        return { status: HttpStatus.OK, result: userWithRelations };
    }

    async getSelf(username: string): Promise<APIResult<IUser>> {
        const user = (await this.userModel.findOne({ username }).populate('satellites')).toObject() as IUser;
        if (!user) {
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        }

        const userWithRelations = await this.getRelations(user);
        return { status: HttpStatus.OK, result: userWithRelations };
    }

    async getUserFollowing(username: string): Promise<APIResult<IUserInfo[]>> {
        const following = await this.neo4jService.read(UserNeoQueries.getFollowing, { username }).then((result) => {
            return result.records.map((record) => record.get('following').properties as IUserInfo);
        });
        return { status: HttpStatus.OK, result: following };
    }

    async getUserFollowers(username: string): Promise<APIResult<IUserInfo[]>> {
        const followers = await this.neo4jService.read(UserNeoQueries.getFollowers, { username }).then((result) => {
            return result.records.map((record) => record.get('follower').properties as IUserInfo);
        });
        return { status: HttpStatus.OK, result: followers };
    }

    async getUserTracking(username: string): Promise<APIResult<ISatellite[]>> {
        let tracking = await this.neo4jService
            .read(SatelliteNeoQueries.getTrackedSatellites, { username })
            .then((result) => {
                return result.records.map((record) => {
                    if (record.get('satellite').properties.launchDate) {
                        record.get('satellite').properties.launchDate = record
                            .get('satellite')
                            .properties.launchDate.toString();
                    }
                    return { ...record.get('satellite').properties, id: undefined } as ISatellite;
                });
            });

        for (let i = 0; i < tracking.length; i++) {
            const satelliteInfo = await this.satelliteModel
                .find({ satelliteName: tracking[i].satelliteName })
                .populate('createdBy', 'username');
            for (let j = 0; j < satelliteInfo.length; j++) {
                if ((satelliteInfo[j].createdBy as any).username == tracking[i].createdBy) {
                    tracking[i].id = satelliteInfo[j]._id;
                }
            }
        }

        return { status: HttpStatus.OK, result: tracking };
    }

    async update(id: Id, updateUserDto: UpdateUserDto): Promise<APIResult<IUser>> {
        const updatedUser = await this.userModel.findByIdAndUpdate(id, updateUserDto, { new: true });
        return { status: HttpStatus.OK, result: updatedUser };
    }

    async followUser(username: string, toFollow: string): Promise<APIResult<{ message: string }>> {
        try {
            const result = await this.neo4jService.write(UserNeoQueries.followUser, { username, toFollow });
            if (result.summary.counters.updates().relationshipsCreated == 0)
                throw new HttpException('Something went wrong', HttpStatus.INTERNAL_SERVER_ERROR);
            return { status: HttpStatus.OK, result: { message: 'User followed' } };
        } catch (error) {
            this.logger.error(error);
            throw new HttpException('Could not follow user', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async unfollowUser(username: string, toUnfollow: string): Promise<APIResult<{ message: string }>> {
        try {
            const result = await this.neo4jService.write(UserNeoQueries.unfollowUser, { username, toUnfollow });
            if (result.summary.counters.updates().relationshipsDeleted == 0)
                throw new HttpException('Something went wrong', HttpStatus.INTERNAL_SERVER_ERROR);
            return { status: HttpStatus.OK, result: { message: 'User unfollowed' } };
        } catch (error) {
            this.logger.error(error);
            throw new HttpException('Could not unfollow user', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
