import { Injectable } from '@angular/core';
import { environment } from 'apps/satellite-tracker/src/environments/environment';
import { IUser } from 'shared/domain';
import { BehaviorSubject, map, Observable, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { EntityService } from 'ui/entity';

@Injectable({
    providedIn: 'root',
})
export class UserService extends EntityService<IUser> {
    users: IUser[] = [];
    admin = localStorage.getItem('admin') === 'true';
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
}
