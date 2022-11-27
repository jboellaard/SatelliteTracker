import { Injectable } from '@angular/core';
// import { GeographicLocation, User } from './user.model';
// import { EntityService } from 'ui/entity';
// import { APIResponse, Satellite } from 'shared/domain';
// import { HttpClient } from '@angular/common/http';
// import { environment } from 'apps/satellite-tracker/src/environments/environment';
import { User } from './user.model';
import { BehaviorSubject, map, Observable, tap } from 'rxjs';

let users: User[] = [
  {
    id: 1,
    username: 'joy',
    password: 'Secret12#',
    profileDescription: '',
    emailAddress: 'je.boellaard@student.avans.nl',
    location: { latitude: 51.813297, longitude: 4.690093 },
    createdAt: new Date(2022, 11, 18),
    roles: ['user'],
  },
  {
    id: 2,
    username: 'satellitemaker',
    password: 'Secret12#',
    profileDescription: '',
    emailAddress: 'creator@mail.com',
    location: { latitude: 44.5, longitude: 11.34 },
    createdAt: new Date(2022, 11, 18),
    roles: ['user'],
  },
  {
    id: 3,
    username: 'firsttracker',
    password: 'Secret12#',
    profileDescription: '',
    emailAddress: 'first@mail.com',
    location: { latitude: 52.370216, longitude: 4.895168 },
    createdAt: new Date(2022, 11, 17),
    roles: ['user'],
  },
  {
    id: 4,
    username: 'launcher101',
    password: 'Secret12#',
    profileDescription: '',
    emailAddress: 'l@mail.com',
    location: { latitude: 4.370216, longitude: 4.895168 },
    createdAt: new Date(),
    roles: ['user'],
  },
  {
    id: 5,
    username: 'lovespacefrfr',
    password: 'Secret12#',
    profileDescription: '',
    emailAddress: 'spaced@mail.com',
    location: { latitude: 52.370216, longitude: 50.895168 },
    createdAt: new Date(),
    roles: ['user'],
  },
];

@Injectable({
  providedIn: 'root',
})
export class UserService {
  users: User[] = [];
  private exampleDataSource = new BehaviorSubject<any>(null);
  readonly exampleData$ = this.exampleDataSource.asObservable();

  // constructor(http: HttpClient) {
  //   super(http, '/', 'api/users');
  // }

  create(user: User) {
    if (!user.id) {
      user.id = users[users.length - 1].id! + 1;
    }
    users.push(user);
  }

  update(user: User) {
    users = users.map((u) => (u.id === user.id ? user : u));
  }

  delete(id: number) {
    users = users.filter((user) => user.id !== id);
  }

  getAllUsers(): User[] {
    return users;
  }

  deleteByUsername(username: string) {
    users = users.filter((user) => user.username !== username);
  }

  getById(id: number): User | undefined {
    return users.find((user) => user.id === id);
  }

  getUserByUsername(username: string): User | undefined {
    return users.find((user) => user.username === username);
  }

  hasUniqueUsername(username: string): boolean {
    return users.every((user) => user.username.trim().toLowerCase() != username.trim().toLowerCase());
  }
}
