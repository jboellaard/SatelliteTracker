import { Injectable, Logger } from '@nestjs/common';
import { User } from 'shared/domain';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

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
      id: this.users[this.users.length - 1].id! + 1,
      ...newUser,
      createdAt: new Date(),
    };
    this.users.push(user);
    return { results: user };
  }

  findAll() {
    return { results: this.users };
  }

  findOne(id: number) {
    const user = this.users.find((user) => user.id === id);
    if (!user) return { results: null };
    return { results: user };
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    const user = this.users.find((user) => user.id === id);
    if (user) {
      const updatedUser = { ...user, ...updateUserDto };
      this.users = this.users.map((user) => (user.id === id ? updatedUser : user));
      return { results: updatedUser };
    }
    return { results: null };
  }

  remove(id: number) {
    Logger.log(`Removing user with id ${id}`);
    const user = this.users.find((user) => user.id === id);
    this.users = this.users.filter((user) => user.id !== id);
    console.log('hoi');
    return { results: user };
  }
}