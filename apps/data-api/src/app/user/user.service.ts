import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Id, UserRegistration } from 'shared/domain';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserDocument } from './user.schema';

@Injectable()
export class UserService {
    constructor(@InjectModel(User.name, 'satellitetrackerdb') private userModel: Model<UserDocument>) {}

    async findAll(): Promise<User[]> {
        return this.userModel.find();
    }

    async findOne(id: Id) {
        return this.userModel.findById(id);
    }

    async update(id: Id, updateUserDto: UpdateUserDto) {
        return this.userModel.findByIdAndUpdate(id, updateUserDto, { new: true });
    }
}
