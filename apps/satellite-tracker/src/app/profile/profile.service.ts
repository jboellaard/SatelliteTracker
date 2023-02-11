import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map, Subject, tap, catchError, BehaviorSubject } from 'rxjs';
import { ISatellite, APIResponse, IUserInfo } from 'shared/domain';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root',
})
export class ProfileService {
    url: string = environment.API_URL;

    constructor(private http: HttpClient) {}

    protected _followingRefreshRequired = new Subject<void>();
    protected _trackingRefreshRequired = new Subject<void>();

    getFollowingRefreshRequired() {
        return this._followingRefreshRequired;
    }

    getTrackingRefreshRequired() {
        return this._trackingRefreshRequired;
    }

    getSelf(): Observable<IUserInfo | undefined> {
        return this.http.get<APIResponse<IUserInfo | undefined>>(this.url + 'self/info').pipe(
            map((response) => response.result),
            catchError(this.handleError)
        );
    }

    getMySatellites(username: string): Observable<ISatellite[] | undefined> {
        return this.http.get<APIResponse<ISatellite[] | undefined>>(this.url + `users/${username}/satellites`).pipe(
            map((response) => response.result),
            catchError(this.handleError)
        );
    }

    getFollowing(username: string): Observable<IUserInfo[] | undefined> {
        return this.http.get<APIResponse<IUserInfo[] | undefined>>(this.url + `users/${username}/following`).pipe(
            map((response) => response.result),
            catchError(this.handleError)
        );
    }

    getFollowers(username: string): Observable<IUserInfo[] | undefined> {
        return this.http.get<APIResponse<IUserInfo[] | undefined>>(this.url + `users/${username}/followers`).pipe(
            map((response) => response.result),
            catchError(this.handleError)
        );
    }

    getTracking(username: string): Observable<ISatellite[] | undefined> {
        return this.http.get<APIResponse<ISatellite[] | undefined>>(this.url + `users/${username}/tracking`).pipe(
            map((response) => response.result),
            catchError(this.handleError)
        );
    }

    followUser(username: string): Observable<string | undefined> {
        return this.http.post<APIResponse<string | undefined>>(this.url + `users/${username}/follow`, {}).pipe(
            tap(() => this._followingRefreshRequired.next()),
            map((response) => response.result),
            catchError(this.handleError)
        );
    }

    unfollowUser(username: string): Observable<string | undefined> {
        return this.http.delete<APIResponse<string | undefined>>(this.url + `users/${username}/follow`).pipe(
            tap(() => this._followingRefreshRequired.next()),
            map((response) => response.result),
            catchError(this.handleError)
        );
    }

    trackSatellite(username: string, satelliteId: string): Observable<string | undefined> {
        return this.http.post<APIResponse<string | undefined>>(this.url + `satellites/${satelliteId}/track`, {}).pipe(
            tap(() => this._trackingRefreshRequired.next()),
            map((response) => response.result),
            catchError(this.handleError)
        );
    }

    untrackSatellite(username: string, satelliteId: string): Observable<string | undefined> {
        return this.http.delete<APIResponse<string | undefined>>(this.url + `satellites/${satelliteId}/track`).pipe(
            tap(() => this._trackingRefreshRequired.next()),
            map((response) => response.result),
            catchError(this.handleError)
        );
    }

    public handleError(error: HttpErrorResponse): Observable<any> {
        console.log(error);

        const errorResponse = {
            type: 'error',
            message: error.error.message || error.message,
        };
        return new Observable((observer) => {
            observer.error(errorResponse);
        });
    }
}
