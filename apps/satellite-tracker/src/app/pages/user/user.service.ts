import { Injectable } from '@angular/core';
import { environment } from 'apps/satellite-tracker/src/environments/environment';
import { AdminUserInfo, APIResponse, IUser, UserIdentity } from 'shared/domain';
import { BehaviorSubject, catchError, map, Observable, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { EntityService } from 'ui/entity';

@Injectable({
    providedIn: 'root',
})
export class UserService extends EntityService<IUser> {
    constructor(http: HttpClient) {
        super(http, environment.API_URL, 'users');
    }

    public getByUsername(username: string | null, options?: any): Observable<IUser | undefined> {
        return this.http.get<APIResponse<IUser | undefined>>(`${this.url}${this.endpoint}/${username}`).pipe(
            map((response: any) => response.result),
            catchError(this.handleError)
        );
    }

    getAllIdentities(): Observable<AdminUserInfo[]> {
        return this.http.get<APIResponse<AdminUserInfo[]>>(`${environment.API_URL}identities`).pipe(
            map((response: any) => response.result),
            catchError(this.handleError)
        );
    }

    followUser(username: string): Observable<UserIdentity> {
        return this.http.post<APIResponse<UserIdentity>>(`${environment.API_URL}${username}/follows`, {}).pipe(
            map((response: any) => response.result),
            catchError(this.handleError)
        );
    }
}
