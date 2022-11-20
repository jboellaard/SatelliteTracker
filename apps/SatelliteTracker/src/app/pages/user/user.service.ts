import { Injectable } from '@angular/core';
import { GeographicLocation, User } from './user.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  users: User[] = [
    {
      id: 1,
      username: 'joy',
      profiledescription: '',
      email: 'je.boellaard@student.avans.nl',
      password: 'Secret12#',
      location: new GeographicLocation(51.813297, 4.690093),
      createdAt: new Date(2022, 11, 18),
      updatedAt: new Date(2022, 11, 18),
    },
    {
      id: 2,
      username: 'satellitemaker',
      profiledescription: '',
      email: 'sm@mail.com',
      password: 'Secret12#',
      location: new GeographicLocation(44.5, 11.34),
      createdAt: new Date(2022, 11, 18),
      updatedAt: new Date(2022, 11, 18),
    },
    {
      id: 3,
      username: 'satellitewatcher',
      profiledescription: '',
      email: 'sw@mail.com',
      password: 'Secret12#',
      location: new GeographicLocation(52.370216, 4.895168),
      createdAt: new Date(2022, 11, 17),
      updatedAt: new Date(2022, 11, 18),
    },
    {
      id: 4,
      username: 'bestlauncher',
      profiledescription: '',
      email: 'bestl@mail.com',
      password: 'Secret12#',
      location: new GeographicLocation(4.370216, 4.895168),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 5,
      username: 'bestwatcher',
      profiledescription: '',
      email: 'bestw@mail.com',
      password: 'Secret12#',
      location: new GeographicLocation(52.370216, 50.895168),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];
  constructor() {
    console.log('UserService created');
  }

  getAllUsers(): User[] {
    return this.users;
  }

  addUser(user: User) {
    if (!user.id) {
      user.id = this.users[this.users.length - 1].id! + 1;
    }
    this.users.push(user);
  }

  updateUser(user: User) {
    this.users = this.users.map((u) => (u.id === user.id ? user : u));
  }

  removeUser(id: number) {
    this.users = this.users.filter((user) => user.id !== id);
  }

  removeUserByUsername(username: string) {
    this.users = this.users.filter((user) => user.username !== username);
  }

  getUserById(id: number): User | undefined {
    return this.users.find((user) => user.id === id);
  }

  getUserByUsername(username: string): User | undefined {
    return this.users.find((user) => user.username === username);
  }

  hasUniqueUsername(username: string): boolean {
    return this.users.every((user) => user.username.trim().toLowerCase() != username.trim().toLowerCase());
  }
}
