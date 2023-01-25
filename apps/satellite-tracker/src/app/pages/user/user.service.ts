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
    constructor(http: HttpClient) {
        super(http, environment.API_URL, 'users');
    }

    getByUsername(username: string): Observable<IUser> {
        return this.http
            .get<IUser>(`${environment.API_URL}${'users'}/${username}`)
            .pipe(map((response: any) => response.result));
    }
}
