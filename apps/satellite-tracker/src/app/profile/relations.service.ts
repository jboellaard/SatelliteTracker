import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, map, of, tap } from 'rxjs';
import { IUserInfo, ISatellite, UserIdentity, APIResponse } from 'shared/domain';
import { environment } from '../../environments/environment';
import { AuthService } from '../auth/auth.service';

@Injectable({
    providedIn: 'root',
})
export class RelationsService {
    user: UserIdentity | undefined;
    following$ = new BehaviorSubject<IUserInfo[] | undefined>(undefined);
    tracking$ = new BehaviorSubject<ISatellite[] | undefined>(undefined);

    constructor(private http: HttpClient, private authService: AuthService) {
        this.authService.user$.subscribe((user) => {
            this.user = user;
            this.getFollowing(user?.username).subscribe((following) => {
                this.following$.next(following);
            });
            this.getTracking(user?.username).subscribe((tracking) => {
                this.tracking$.next(tracking);
            });
        });
    }

    getFollowing(username: string | undefined = this.user?.username) {
        return this.http.get<APIResponse<IUserInfo[]>>(`${environment.API_URL}users/${username}/following`).pipe(
            map((res) => res.result),
            catchError((err) => {
                console.log("Couldn't get following", err);
                return of(undefined);
            })
        );
    }

    getTracking(username: string | undefined = this.user?.username) {
        return this.http.get<APIResponse<ISatellite[]>>(`${environment.API_URL}users/${username}/tracking`).pipe(
            map((res) => res.result),
            catchError((err) => {
                console.log("Couldn't get tracking", err);
                return of(undefined);
            })
        );
    }
}
