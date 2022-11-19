import { Injectable } from '@angular/core';
import { User } from './user.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  users: User[] = [
    {
      id: 1,
      name: 'John',
      email: 'Johnsemail@mail.com',
      location: [52.370216, 4.895168],
    },
    {
      id: 2,
      name: 'Jane',
      email: 'Janesemail@mail.com',
      location: [44.5, 11.34],
    },
    {
      id: 3,
      name: 'Joy',
      email: 'Joysemail@mail.com',
      location: [51.813297, 4.690093],
    },
  ];
  constructor() {
    console.log('UserService created');
  }

  getAllUsers(): User[] {
    return this.users;
  }

  addUser(user: User) {
    this.users.push(user);
  }

  removeUser(id: number) {
    this.users = this.users.filter((user) => user.id !== id);
  }
}
