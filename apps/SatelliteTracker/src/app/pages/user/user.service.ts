import { Injectable } from '@angular/core';
import { GeographicLocation, User } from './user.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  users: User[] = [
    {
      id: 1,
      name: 'John',
      email: 'Johnsemail@mail.com',
      location: new GeographicLocation(52.370216, 4.895168),
      createdAt: new Date(),
      updatedAt: undefined,
    },
    {
      id: 2,
      name: 'Jane',
      email: 'Janesemail@mail.com',
      location: new GeographicLocation(44.5, 11.34),
      createdAt: new Date(),
      updatedAt: undefined,
    },
    {
      id: 3,
      name: 'Joy',
      email: 'Joysemail@mail.com',
      location: new GeographicLocation(51.813297, 4.690093),
      createdAt: new Date(),
      updatedAt: undefined,
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

  getUserById(id: number): User {
    return this.users.find((user) => user.id === id)!;
  }
}
