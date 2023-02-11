import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, OnInit } from '@angular/core';
import { Observable, map, Subject, tap, catchError, BehaviorSubject } from 'rxjs';
import { ISatellite, APIResponse, IUserInfo, Id } from 'shared/domain';
import { environment } from '../../environments/environment';
import { SnackBarService } from '../utils/snack-bar.service';
import { RelationsService } from './relations.service';

@Injectable({
    providedIn: 'root',
})
export class ProfileService {
    url: string = environment.API_URL;
    currentUser$ = new BehaviorSubject<IUserInfo | undefined>(undefined);
    canEdit$ = new BehaviorSubject<boolean>(false);

    constructor(
        private http: HttpClient,
        private relationsService: RelationsService,
        private snackbar: SnackBarService
    ) {}

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
            tap((res) => {
                if (res.status == 200) {
                    this.snackbar.success('User followed successfully');
                    this.relationsService
                        .getFollowing()
                        .subscribe((following) => this.relationsService.following$.next(following));
                } else {
                    this.snackbar.error('Something went wrong, please try again later.');
                }
            }),
            catchError(this.handleError)
        );
    }

    unfollowUser(username: string): Observable<string | undefined> {
        return this.http.delete<APIResponse<string | undefined>>(this.url + `users/${username}/follow`).pipe(
            tap((res) => {
                if (res.status == 200) {
                    this.snackbar.success('You are no longer following this user');
                    this.relationsService
                        .getFollowing()
                        .subscribe((following) => this.relationsService.following$.next(following));
                } else {
                    this.snackbar.error('Something went wrong, please try again later.');
                }
            }),
            catchError(this.handleError)
        );
    }

    trackSatellite(satelliteId: Id): Observable<string | undefined> {
        return this.http.post<APIResponse<string | undefined>>(this.url + `satellites/${satelliteId}/track`, {}).pipe(
            tap((res) => {
                if (res.status == 200) {
                    this.snackbar.success('Satellite tracked successfully');
                    this.relationsService
                        .getTracking()
                        .subscribe((tracking) => this.relationsService.tracking$.next(tracking));
                } else {
                    this.snackbar.error('Something went wrong, please try again later.');
                }
            }),
            catchError(this.handleError)
        );
    }

    untrackSatellite(satelliteId: Id): Observable<string | undefined> {
        return this.http.delete<APIResponse<string | undefined>>(this.url + `satellites/${satelliteId}/track`).pipe(
            tap((res) => {
                if (res.status == 200) {
                    this.snackbar.success('You are no longer tracking this satellite');
                    this.relationsService
                        .getTracking()
                        .subscribe((tracking) => this.relationsService.tracking$.next(tracking));
                } else {
                    this.snackbar.error('Something went wrong, please try again later.');
                }
            }),
            catchError(this.handleError)
        );
    }

    handleError(error: HttpErrorResponse): Observable<any> {
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
