import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Id } from 'shared/domain';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UserService {
    private logger = new Logger(UserService.name);
    constructor(@InjectModel(User.name, 'satellitetrackerdb') private userModel: Model<UserDocument>) {}

    async findAll() {
        const users = await this.userModel.find();
        return { status: HttpStatus.OK, users };
    }

    async findOne(id: Id) {
        const user = await this.userModel
            .findOne({ username: id })
            .populate('satellites')
            .populate('satellites.satelliteParts.satellitePart');
        if (!user) {
            return new HttpException('User not found', HttpStatus.NOT_FOUND);
        }
        return { status: HttpStatus.OK, user };
    }

    async update(id: Id, updateUserDto: UpdateUserDto) {
        const updatedUser = await this.userModel.findByIdAndUpdate(id, updateUserDto, { new: true });
        return { status: HttpStatus.OK, updatedUser };
    }
}
