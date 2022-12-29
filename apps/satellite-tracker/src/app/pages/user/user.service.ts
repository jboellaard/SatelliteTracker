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
        super(http, environment.API_URL, 'users');
    }

    getByUsername(username: string): Observable<IUser> {
        const endpoint = `${environment.API_URL}${'users'}/${username}`;
        console.log(`get one ${endpoint}`);
        return this.http.get<IUser>(endpoint).pipe(tap((response: any) => console.log(response)));
    }

    // deleteByUsername(username: string) {
    //     this.users = this.users.filter((user) => user.username !== username);
    // }

    // getUserByUsername(username: string): IUser | undefined {
    //     return this.users.find((user) => user.username === username);
    // }

    // hasUniqueUsername(username: string): boolean {
    //     return this.users.every((user) => user.username.trim().toLowerCase() != username.trim().toLowerCase());
    // }
}
