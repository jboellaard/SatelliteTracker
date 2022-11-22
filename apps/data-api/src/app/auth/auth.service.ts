import { Injectable } from '@nestjs/common';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { LocationCoordinates, User } from 'data';

@Injectable()
export class AuthService {
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

  // async createUser(name: string, emailAddress: string): Promise<string> {
  //   const user = new this.userModel({ name, emailAddress });
  //   await user.save();
  //   return user.id;
  // }

  createUser(
    username: string,
    emailAddress: string,
    location: LocationCoordinates,
    profileDescription = '',
    roles: string[] = ['user']
  ) {
    const user = {
      id: this.users[this.users.length - 1].id + 1,
      username,
      emailAddress,
      location,
      createdAt: new Date(),
      profileDescription,
      roles,
      satellites: [],
    };
    this.users.push(user);
    return user;
  }

  // async registerUser(username: string, password: string, emailAddress: string) {
  //   const generatedHash = await hash(password, parseInt(process.env.SALT_ROUNDS, 10));

  //   const identity = new this.identityModel({ username, hash: generatedHash, emailAddress });

  //   await identity.save();
  // }

  findAll() {
    return `This action returns all auth`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }
}
