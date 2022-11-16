import { Injectable } from '@angular/core';
import { User } from './user.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  users: User[] = [
    {
      id: '12345-123-12',
      name: 'John',
      email: 'Johnsemail@mail.com',
      location: 'Amsterdam',
    },
    {
      id: '12345-123-13',
      name: 'Jane',
      email: 'Janesemail@mail.com',
      location: 'Amsterdam',
    },
    {
      id: '12345-123-14',
      name: 'Joy',
      email: 'Joysemail@mail.com',
      location: 'Papendrecht',
    },
  ];
  constructor() {
    console.log('UserService created');
  }

  getAllUsers(): User[] {
    return this.users;
  }
}
