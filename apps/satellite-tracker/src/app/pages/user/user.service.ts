import { Injectable } from '@angular/core';
import { environment } from 'apps/satellite-tracker/src/environments/environment';
import { AdminUserInfo, APIResponse, IUser, UserIdentity } from 'shared/domain';
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
            .get<APIResponse<IUser>>(`${environment.API_URL}${'users'}/${username}`)
            .pipe(map((response: any) => response.result));
    }

    getAllIdentities(): Observable<AdminUserInfo[]> {
        return this.http
            .get<APIResponse<AdminUserInfo[]>>(`${environment.API_URL}identities`)
            .pipe(map((response: any) => response.result));
    }
}
