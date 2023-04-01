import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map, tap, catchError, BehaviorSubject } from 'rxjs';
import { ISatellite, APIResponse, IUserInfo, IUser } from 'shared/domain';
import { environment } from '../../../environments/environment';
import { SnackBarService } from '../../utils/snack-bar.service';

@Injectable({
    providedIn: 'root',
})
export class ProfileService {
    url: string = environment.API_URL;
    currentUser$ = new BehaviorSubject<IUserInfo | undefined>(undefined);
    canEdit$ = new BehaviorSubject<boolean>(false);

    created$: BehaviorSubject<ISatellite[] | undefined> = new BehaviorSubject<ISatellite[] | undefined>(undefined);
    tracking$: BehaviorSubject<ISatellite[] | undefined> = new BehaviorSubject<ISatellite[] | undefined>(undefined);
    following$: BehaviorSubject<IUser[] | undefined> = new BehaviorSubject<IUser[] | undefined>(undefined);
    followers$: BehaviorSubject<IUser[] | undefined> = new BehaviorSubject<IUser[] | undefined>(undefined);

    constructor(private http: HttpClient, private snackBar: SnackBarService) {}

    getSelf(): Observable<IUserInfo | undefined> {
        return this.http.get<APIResponse<IUserInfo | undefined>>(this.url + 'self/info').pipe(
            map((response) => response.result),
            catchError((error) => this.handleError(error))
        );
    }

    updateSelf(user: IUserInfo): Observable<IUser | undefined> {
        return this.http.patch<APIResponse<IUser | undefined>>(this.url + 'self/info', user).pipe(
            map((response) => response.result),
            catchError((error) => this.handleError(error))
        );
    }

    deleteSelf(): Observable<undefined> {
        return this.http.delete<APIResponse<undefined>>(this.url + 'self').pipe(
            map((response) => response.result),
            catchError((error) => this.handleError(error))
        );
    }

    getCreated(username: string): Observable<ISatellite[] | undefined> {
        return this.http.get<APIResponse<ISatellite[] | undefined>>(this.url + `users/${username}/satellites`).pipe(
            tap((response) => {
                console.log(username);
                if (response.result) this.created$.next(response.result);
            }),
            map((response) => response.result),
            catchError((error) => this.handleError(error))
        );
    }

    getFollowing(username: string): Observable<IUserInfo[] | undefined> {
        return this.http.get<APIResponse<IUserInfo[] | undefined>>(this.url + `users/${username}/following`).pipe(
            tap((response) => {
                if (response.result) this.following$.next(response.result);
            }),
            map((response) => response.result),
            catchError((error) => this.handleError(error))
        );
    }

    getFollowers(username: string): Observable<IUserInfo[] | undefined> {
        return this.http.get<APIResponse<IUserInfo[] | undefined>>(this.url + `users/${username}/followers`).pipe(
            tap((response) => {
                if (response.result) this.followers$.next(response.result);
            }),
            map((response) => response.result),
            catchError((error) => this.handleError(error))
        );
    }

    getTracking(username: string): Observable<ISatellite[] | undefined> {
        return this.http.get<APIResponse<ISatellite[] | undefined>>(this.url + `users/${username}/tracking`).pipe(
            tap((response) => {
                if (response.result) this.tracking$.next(response.result);
            }),
            map((response) => response.result),
            catchError((error) => this.handleError(error))
        );
    }

    private handleError(error: HttpErrorResponse): Observable<any> {
        let res = {
            status: error.status,
            message: 'An error occurred, please try again later',
        };

        if (error.status === 400) {
            if (error.error.message && error.error.message.includes('duplicate'))
                res.message = 'A user with this username already exists';
            else res.message = 'The request was invalid';
        } else if (error.status === 403) res.message = `You are not authorized to perform this action`;
        else if (error.status === 404) res.message = `Could not find this resource`;
        if (error.status != 500 && error.status != 0) this.snackBar.error(res.message);

        return new Observable((observer) => {
            observer.error(res);
        });
    }
}
