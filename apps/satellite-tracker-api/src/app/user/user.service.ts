import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Id } from 'shared/domain';
import { Neo4jService } from '../neo4j/neo4j.service';
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

    async findAll() {
        const users = await this.userModel.find();
        return { status: HttpStatus.OK, result: users };
    }

    async findOne(id: Id) {
        const user = await this.userModel
            .findOne({ username: id })
            .populate('satellites')
            .populate('satellites.satelliteParts.satellitePart');
        if (!user) {
            return new HttpException('User not found', HttpStatus.NOT_FOUND);
        }
        return { status: HttpStatus.OK, result: user };
    }

    async update(id: Id, updateUserDto: UpdateUserDto) {
        const updatedUser = await this.userModel.findByIdAndUpdate(id, updateUserDto, { new: true });
        return { status: HttpStatus.OK, result: updatedUser };
    }

    async followUser(username: string, toFollow: string) {
        try {
            const result = await this.neo4jService.write(UserNeoQueries.followUser, { username, toFollow });
            console.log(result);
            return { status: HttpStatus.OK, result: { message: 'User followed' } };
        } catch (error) {
            this.logger.error(error);
            return new HttpException('Could not follow user', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async unfollowUser(username: string, toUnfollow: string) {
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
