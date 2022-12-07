import { Injectable } from '@angular/core';
// import { GeographicLocation, User } from './user.model';
// import { EntityService } from 'ui/entity';
// import { APIResponse, Satellite } from 'shared/domain';
// import { HttpClient } from '@angular/common/http';
import { environment } from 'apps/satellite-tracker/src/environments/environment';
// import { User } from './user.model';
import { Id, IUser } from 'shared/domain';
import { BehaviorSubject, map, Observable, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { EntityService } from 'ui/entity';

@Injectable({
    providedIn: 'root',
})
export class UserService extends EntityService<IUser> {
    users: IUser[] = [];
    private exampleDataSource = new BehaviorSubject<any>(null);
    readonly exampleData$ = this.exampleDataSource.asObservable();

    constructor(http: HttpClient) {
        super(http, environment.API_URL!, 'users');
    }

    // create(user: User) {
    //   if (!user.id) {
    //     user.id = users[users.length - 1].id! + 1;
    //   }
    //   users.push(user);
    // }

    // update(user: User) {
    //   users = users.map((u) => (u.id === user.id ? user : u));
    // }

    // delete(id: number) {
    //   users = users.filter((user) => user.id !== id);
    // }

    getAllUsers(): IUser[] {
        return this.users;
    }

    deleteByUsername(username: string) {
        this.users = this.users.filter((user) => user.username !== username);
    }

    getById(id: Id): IUser | undefined {
        return this.users.find((user) => user.id === id);
    }

    getUserByUsername(username: string): IUser | undefined {
        return this.users.find((user) => user.username === username);
    }

    hasUniqueUsername(username: string): boolean {
        return this.users.every((user) => user.username.trim().toLowerCase() != username.trim().toLowerCase());
    }
}
