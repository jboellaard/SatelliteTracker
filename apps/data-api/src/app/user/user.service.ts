import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Id } from 'shared/domain';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserDocument } from './user.schema';

// let users: User[] = [
//     {
//         id: '1',
//         username: 'joy',
//         profileDescription: '',
//         emailAddress: 'je.boellaard@student.avans.nl',
//         location: { coordinates: { latitude: 51.813297, longitude: 4.690093 } },
//         createdAt: new Date(2022, 11, 18),
//         roles: ['user'],
//         satellites: [],
//     },
//     {
//         id: '2',
//         username: 'satellitemaker',
//         profileDescription: '',
//         emailAddress: 'creator@mail.com',
//         location: { coordinates: { latitude: 44.5, longitude: 11.34 } },
//         createdAt: new Date(2022, 11, 18),
//         roles: ['user'],
//         satellites: [],
//     },
//     {
//         id: '3',
//         username: 'firsttracker',
//         profileDescription: '',
//         emailAddress: 'first@mail.com',
//         location: { coordinates: { latitude: 52.370216, longitude: 4.895168 } },
//         createdAt: new Date(2022, 11, 17),
//         roles: ['user'],
//         satellites: [],
//     },
//     {
//         id: '4',
//         username: 'launcher101',
//         profileDescription: '',
//         emailAddress: 'l@mail.com',
//         location: { coordinates: { latitude: 4.370216, longitude: 4.895168 } },
//         createdAt: new Date(),
//         roles: ['user'],
//         satellites: [],
//     },
//     {
//         id: '5',
//         username: 'lovespacefrfr',
//         profileDescription: '',
//         emailAddress: 'spaced@mail.com',
//         location: { coordinates: { latitude: 52.370216, longitude: 50.895168 } },
//         createdAt: new Date(),
//         roles: ['user'],
//         satellites: [],
//     },
// ];

@Injectable()
export class UserService {
    constructor(@InjectModel(User.name, 'satellitetrackerdb') private userModel: Model<UserDocument>) {}

    // create(newUser: User) {
    //     const user = {
    //         id: 'temp',
    //         ...newUser,
    //         createdAt: new Date(),
    //     };
    //     // users.push(user);
    //     return { results: user };
    // }

    async findAll(): Promise<User[]> {
        return this.userModel.find().exec();
    }

    findOne(id: Id) {
        return { results: this.userModel.findById(id).exec() };
    }

    update(id: Id, updateUserDto: UpdateUserDto) {
        return { results: this.userModel.findByIdAndUpdate(id, updateUserDto, { new: true }).exec() };
    }

    // findOne(id: Id) {
    //     const user = users.find((user) => user.id === id);
    //     if (!user) return { results: null };
    //     return { results: user };
    // }

    // update(id: Id, updateUserDto: UpdateUserDto) {
    //     const user = users.find((user) => user.id === id);
    //     if (user) {
    //         const updatedUser = { ...user, ...updateUserDto };
    //         users = users.map((user) => (user.id === id ? updatedUser : user));
    //         return { results: updatedUser };
    //     }
    //     return { results: null };
    // }

    // remove(id: Id) {
    //     Logger.log(`Removing user with id ${id}`);
    //     const user = users.find((user) => user.id === id);
    //     users = users.filter((user) => user.id !== id);
    //     console.log('hoi');
    //     return { results: user };
    // }
}
