import { Injectable } from '@angular/core';
// import { GeographicLocation, User } from './user.model';
import { EntityService } from 'ui/entity';
import { User, APIResponse, Satellite } from 'shared/domain';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, map, Observable, tap } from 'rxjs';
// import { environment } from 'apps/satellite-tracker/src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UserService extends EntityService<User> {
  users: User[] = [];
  private exampleDataSource = new BehaviorSubject<any>(null);
  readonly exampleData$ = this.exampleDataSource.asObservable();

  constructor(http: HttpClient) {
    // console.log(environment.API_URL);
    super(http, '/', 'api/users');
    console.log('UserService created');
    // console.log(process.env.API_URL);
  }

  getUserById(id: string): Observable<User | undefined> {
    console.log('getUserById');
    // return this.http.get<User>(`${this.url}${this.endpoint}/${id}`);
    return this.http.get<APIResponse<User>>(`/api/users/${id}`).pipe(
      map((response: APIResponse<User>) => response.results),
      tap((user: User) => {
        return user;
      })
    );
  }

  getAllUsers(): Observable<User[]> {
    return this.http.get<APIResponse<User[]>>(`/api/users`).pipe(
      map((response: APIResponse<User[]>) => response.results),
      tap((users: User[]) => {
        return users;
      })
    );
  }

  // addUser(user: User) {
  //   if (!user.id) {
  //     user.id = this.users[this.users.length - 1].id! + 1;
  //   }
  //   this.users.push(user);
  // }

  // updateUser(user: User, options?: any) {
  //   return this.http
  //     .put<APIResponse<User>>(`/api/users/${user.id}`, user, { ...options, ...httpOptions })
  //     .pipe(map((response: APIResponse<User>) => response.results));
  //   // this.users = this.users.map((u) => (u.id === user.id ? user : u));
  // }

  // removeUser(id: number) {
  //   this.users = this.users.filter((user) => user.id !== id);
  // }

  removeUserByUsername(username: string) {
    this.users = this.users.filter((user) => user.username !== username);
  }

  // getUserById(id: number): User | undefined {
  //   return this.users.find((user) => user.id === id);
  // }

  getUserByUsername(username: string): User | undefined {
    return this.users.find((user) => user.username === username);
  }

  hasUniqueUsername(username: string): boolean {
    return this.users.every((user) => user.username.trim().toLowerCase() != username.trim().toLowerCase());
  }
}
