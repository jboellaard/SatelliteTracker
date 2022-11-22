import { Injectable } from '@nestjs/common';
import { User } from 'data';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService {
  users: User[] = [
    {
      id: 1,
      username: 'joy',
      profileDescription: '',
      emailAddress: 'je.boellaard@student.avans.nl',
      location: { latitude: 51.813297, longitude: 4.690093 },
      createdAt: new Date(2022, 11, 18),
      roles: ['user'],
      satellites: [],
    },
    {
      id: 2,
      username: 'satellitemaker',
      profileDescription: '',
      emailAddress: 'creator@mail.com',
      location: { latitude: 44.5, longitude: 11.34 },
      createdAt: new Date(2022, 11, 18),
      roles: ['user'],
      satellites: [],
    },
    {
      id: 3,
      username: 'firsttracker',
      profileDescription: '',
      emailAddress: 'first@mail.com',
      location: { latitude: 52.370216, longitude: 4.895168 },
      createdAt: new Date(2022, 11, 17),
      roles: ['user'],
      satellites: [],
    },
    {
      id: 4,
      username: 'launcher101',
      profileDescription: '',
      emailAddress: 'l@mail.com',
      location: { latitude: 4.370216, longitude: 4.895168 },
      createdAt: new Date(),
      roles: ['user'],
      satellites: [],
    },
    {
      id: 5,
      username: 'lovespacefrfr',
      profileDescription: '',
      emailAddress: 'spaced@mail.com',
      location: { latitude: 52.370216, longitude: 50.895168 },
      createdAt: new Date(),
      roles: ['user'],
      satellites: [],
    },
  ];

  create(newUser: CreateUserDto) {
    const user = {
      id: this.users[this.users.length - 1].id + 1,
      username: newUser.username,
      profileDescription: newUser.profileDescription,
      emailAddress: newUser.emailAddress,
      location: newUser.location,
      createdAt: new Date(),
      roles: newUser.roles,
      satellites: [],
    };
    this.users.push(user);
    return user;
  }

  getAll() {
    return this.users;
  }

  getUserById(id: number) {
    return this.users.find((user) => user.id === id);
  }

  // update(id: number, updateUserDto: UpdateUserDto) {
  //   return `This action updates a #${id} user`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} user`;
  // }
}
