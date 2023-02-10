import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { APIResult, Id, ISatellite, IUser, IUserInfo } from 'shared/domain';
import { Neo4jService } from '../neo4j/neo4j.service';
import { SatelliteNeoQueries } from '../satellite/neo4j/satellite.cypher';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserNeoQueries } from './neo4j/user.cypher';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UserService {
    private logger = new Logger(UserService.name);
    constructor(
        @InjectModel(User.name, `${process.env.MONGO_DATABASE}`) private userModel: Model<UserDocument>,
        private readonly neo4jService: Neo4jService
    ) {}

    async findAll(): Promise<APIResult<IUser[]>> {
        const users = await this.userModel.find();
        return { status: HttpStatus.OK, result: users };
    }

    async findOne(username: string): Promise<APIResult<IUser> | HttpException> {
        const user = (await this.userModel.findOne({ username }).populate('satellites')).toObject() as IUser; // .populate('satellites.satelliteParts.satellitePart'))
        if (!user) {
            return new HttpException('User not found', HttpStatus.NOT_FOUND);
        }
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

        const userWithRelations = { ...user, followers, following, tracking };
        await neoSession.close();
        return { status: HttpStatus.OK, result: userWithRelations };
    }

    async update(id: Id, updateUserDto: UpdateUserDto): Promise<APIResult<IUser>> {
        const updatedUser = await this.userModel.findByIdAndUpdate(id, updateUserDto, { new: true });
        return { status: HttpStatus.OK, result: updatedUser };
    }

    async followUser(username: string, toFollow: string): Promise<APIResult<{ message: string }> | HttpException> {
        try {
            const result = await this.neo4jService.write(UserNeoQueries.followUser, { username, toFollow });
            console.log(result);
            return { status: HttpStatus.OK, result: { message: 'User followed' } };
        } catch (error) {
            this.logger.error(error);
            return new HttpException('Could not follow user', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async unfollowUser(username: string, toUnfollow: string): Promise<APIResult<{ message: string }> | HttpException> {
        try {
            const result = await this.neo4jService.write(UserNeoQueries.unfollowUser, { username, toUnfollow });
            console.log(result);
            return { status: HttpStatus.OK, result: { message: 'User unfollowed' } };
        } catch (error) {
            this.logger.error(error);
            return new HttpException('Could not unfollow user', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
