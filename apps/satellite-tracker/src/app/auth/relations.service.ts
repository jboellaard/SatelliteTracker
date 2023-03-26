import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, OnInit } from '@angular/core';
import { BehaviorSubject, catchError, map, Observable, of, tap } from 'rxjs';
import { IUserInfo, ISatellite, UserIdentity, APIResponse, Id } from 'shared/domain';
import { environment } from '../../environments/environment';
import { ProfileService } from '../profile/profile.service';
import { SnackBarService } from '../utils/snack-bar.service';
import { AuthService } from './auth.service';

@Injectable({
    providedIn: 'root',
})
export class RelationsService {
    user: UserIdentity | undefined;
    following$ = new BehaviorSubject<IUserInfo[] | undefined>(undefined);
    tracking$ = new BehaviorSubject<ISatellite[] | undefined>(undefined);

    constructor(
        private http: HttpClient,
        private authService: AuthService,
        private profileService: ProfileService,
        private snackBar: SnackBarService
    ) {
        this.authService.user$.subscribe((user) => {
            if (user) {
                this.user = user;
                this.getFollowing().subscribe();
                this.getTracking().subscribe();
            } else {
                this.user = undefined;
                this.following$.next(undefined);
                this.tracking$.next(undefined);
            }
        });
    }

    getFollowing() {
        if (!this.user?.username) return of(undefined);
        return this.http
            .get<APIResponse<IUserInfo[]>>(`${environment.API_URL}users/${this.user?.username}/following`)
            .pipe(
                tap((res) => {
                    if (res.result) {
                        this.following$.next(res.result);
                        if (this.profileService.canEdit$?.value) this.profileService.following$.next(res.result);
                    }
                }),
                map((res) => res.result),
                catchError((err) => this.handleError(err))
            );
    }

    getTracking() {
        if (!this.user?.username) return of(undefined);
        return this.http
            .get<APIResponse<ISatellite[]>>(`${environment.API_URL}users/${this.user?.username}/tracking`)
            .pipe(
                tap((res) => {
                    if (res.result) this.tracking$.next(res.result);
                }),
                map((res) => res.result),
                catchError((err) => this.handleError(err))
            );
    }

    followUser(username: string) {
        return this.http
            .post<APIResponse<IUserInfo[] | undefined>>(`${environment.API_URL}users/${username}/follow`, {})
            .pipe(
                tap((res) => {
                    console.log(res);
                    if (res.status == 200) {
                        this.snackBar.success('User followed successfully');
                        this.following$.next(res.result);
                        if (this.profileService.canEdit$?.value) this.profileService.following$.next(res.result);
                    } else {
                        this.snackBar.error('Something went wrong, please try again later.');
                    }
                }),
                catchError((error) => this.handleError(error))
            );
    }

    unfollowUser(username: string) {
        return this.http
            .delete<APIResponse<IUserInfo[] | undefined>>(`${environment.API_URL}users/${username}/follow`)
            .pipe(
                tap((res) => {
                    if (res.status == 200) {
                        this.snackBar.success('You are no longer following this user');
                        this.following$.next(res.result);
                        if (this.profileService.canEdit$?.value) this.profileService.following$.next(res.result);
                    } else {
                        this.snackBar.error('Something went wrong, please try again later.');
                    }
                }),
                catchError((error) => this.handleError(error))
            );
    }

    trackSatellite(satelliteId: Id) {
        return this.http
            .post<APIResponse<ISatellite[] | undefined>>(`${environment.API_URL}satellites/${satelliteId}/track`, {})
            .pipe(
                tap((res) => {
                    if (res.status == 200) {
                        this.snackBar.success('Satellite tracked successfully');
                        this.tracking$.next(res.result);
                        if (this.profileService.canEdit$?.value) this.profileService.tracking$.next(res.result);
                    } else {
                        this.snackBar.error('Something went wrong, please try again later.');
                    }
                }),
                catchError((error) => this.handleError(error))
            );
    }

    untrackSatellite(satelliteId: Id) {
        return this.http
            .delete<APIResponse<ISatellite[] | undefined>>(`${environment.API_URL}satellites/${satelliteId}/track`)
            .pipe(
                tap((res) => {
                    if (res.status == 200) {
                        this.snackBar.success('You are no longer tracking this satellite');
                        this.tracking$.next(res.result);
                        if (this.profileService.canEdit$?.value) this.profileService.tracking$.next(res.result);
                    } else {
                        this.snackBar.error('Something went wrong, please try again later.');
                    }
                }),
                catchError((error) => this.handleError(error))
            );
    }

    private handleError(error: HttpErrorResponse): Observable<any> {
        let res = {
            status: error.status,
            message: 'Something went wrong, please try again later',
        };
        if (error.status === 400) res.message = 'This request is invalid';
        else if (error.status === 403) res.message = `You are not authorized to access this resource`;
        else if (error.status === 404) res.message = `Could not find this user`;
        if (error.status != 500 && error.status != 0) this.snackBar.error(res.message);

        return new Observable((observer) => {
            observer.error(res);
        });
    }
}
