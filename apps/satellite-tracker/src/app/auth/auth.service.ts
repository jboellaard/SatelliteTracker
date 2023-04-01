import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, map, Observable, of, switchMap, tap } from 'rxjs';
import { UserCredentials, UserIdentity, UserRegistration, Token, APIResponse, ISatellite } from 'shared/domain';
import { environment } from '../../environments/environment';
import { SnackBarService } from '../utils/snack-bar.service';

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    private readonly headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    private readonly CURRENT_USER = 'currentUser';
    user$ = new BehaviorSubject<UserIdentity | undefined>(undefined);
    createdSatellites$ = new BehaviorSubject<ISatellite[] | undefined>(undefined);

    constructor(private http: HttpClient, private router: Router, private snackBar: SnackBarService) {
        this.getUserFromLocalStorage()
            .pipe(
                switchMap((user: UserIdentity | undefined) => {
                    if (user) {
                        console.log('User found in local storage');
                        this.user$.next(user);
                        return of(user);
                    } else {
                        console.log('No user found in local storage');
                        return of(undefined);
                    }
                })
            )
            .subscribe(() => {});
    }

    private getExpirationDate(loginTime: string): Date {
        let expiresAt = new Date();
        if (loginTime.includes('d')) {
            const days = loginTime.split('d')[0];
            expiresAt.setDate(expiresAt.getDate() + Number(days));
        } else if (loginTime.includes('h')) {
            const hours = loginTime.split('h')[0];
            expiresAt.setHours(expiresAt.getHours() + Number(hours));
        } else if (loginTime.includes('m')) {
            const minutes = loginTime.split('m')[0];
            expiresAt.setMinutes(expiresAt.getMinutes() + Number(minutes));
        } else if (loginTime.includes('s')) {
            const seconds = loginTime.split('s')[0];
            expiresAt.setSeconds(expiresAt.getSeconds() + Number(seconds));
        }
        return expiresAt;
    }

    login(credentials: UserCredentials) {
        return this.http.post<any>(`${environment.API_URL}login`, { ...credentials }, { headers: this.headers }).pipe(
            switchMap((res) => {
                if (res.result as Token) {
                    localStorage.setItem('access_token', res.result.accessToken);
                    localStorage.setItem('refresh_token', res.result.refreshToken);
                    this.saveUserToLocalStorage(res.result.user);
                    this.user$.next(res.result.user);
                    const expiresAt = this.getExpirationDate(res.result.refreshTokenExpiresIn);
                    localStorage.setItem('expires_at', JSON.stringify(expiresAt.valueOf()));
                    return of(res.result.user);
                }
                this.snackBar.error('Something went wrong, please try again later.');
                return of(undefined);
            }),
            catchError((error) => {
                if (error.status == 401)
                    return of(
                        "Invalid username or password, please try again or register if you don't have an account yet."
                    );
                return this.handleError(error);
            })
        );
    }

    register(user: UserRegistration) {
        return this.http.post<any>(`${environment.API_URL}register`, { ...user }, { headers: this.headers }).pipe(
            switchMap((res) => {
                if (res.status === 201) {
                    return this.login({ username: user.username, password: user.password });
                }
                this.snackBar.error('Something went wrong, please try again later.');
                return of(undefined);
            }),
            catchError((err) => {
                if (err.status == 400 && err.error.message.includes('already exists')) {
                    return of('This username is already taken, please choose a different username.');
                }
                return this.handleError(err);
            })
        );
    }

    logout(): void {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('expires_at');
        localStorage.removeItem(this.CURRENT_USER);
        this.user$.next(undefined);
        this.router.navigate(['/login']);
    }

    getUserFromLocalStorage(): Observable<UserIdentity | undefined> {
        const user = localStorage.getItem(this.CURRENT_USER);
        if (user) {
            return of(JSON.parse(user));
        }
        return of(undefined);
    }

    private saveUserToLocalStorage(user: UserIdentity) {
        localStorage.setItem(this.CURRENT_USER, JSON.stringify(user));
    }

    getAccessToken(): string | null {
        return localStorage.getItem('access_token');
    }

    isLoggedIn(): boolean {
        return new Date(JSON.parse(localStorage.getItem('expires_at') || '{}')).valueOf() > new Date().valueOf();
    }

    isLoggedOut(): boolean {
        return !this.isLoggedIn();
    }

    refreshToken(): Observable<any> {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken || this.isLoggedOut()) {
            this.logout();
            this.snackBar.error('Session expired, please login again');
            return of(undefined);
        }
        console.log('Refreshing token');
        return this.http
            .get<any>(`${environment.API_URL}token`, {
                headers: { authorization: `Bearer ${refreshToken}` },
            })
            .pipe(
                switchMap((response) => {
                    if (response.result.accessToken) {
                        localStorage.setItem('access_token', response.result.accessToken);
                        localStorage.setItem('refresh_token', response.result.refreshToken);
                        this.user$.next(response.result.user);
                        const expiresAt = this.getExpirationDate(response.result.refreshTokenExpiresIn);
                        localStorage.setItem('expires_at', JSON.stringify(expiresAt.valueOf()));
                        return of(response);
                    }
                    this.snackBar.error('Something went wrong, please try again later');
                    return of(undefined);
                })
            );
    }

    getCreatedSatellites(): Observable<ISatellite[] | undefined> {
        if (this.user$ && this.user$.value) {
            return this.http
                .get<APIResponse<ISatellite[] | undefined>>(
                    `${environment.API_URL}users/${this.user$.value.username}/satellites`
                )
                .pipe(
                    tap((response) => {
                        if (response.result) this.createdSatellites$.next(response.result);
                    }),
                    map((response) => response.result),
                    catchError((error) => this.handleError(error))
                );
        } else {
            return of(undefined);
        }
    }

    private handleError(error: HttpErrorResponse): Observable<any> {
        let res = {
            status: error.status,
            message: 'Something went wrong, please try again later',
        };
        if (error.status === 400) res.message = 'This request is invalid';
        else if (error.status === 403) res.message = `You are not authorized to perform this action`;
        else if (error.status === 404) res.message = `Could not find this entity`;
        if (error.status != 500 && error.status != 0) this.snackBar.error(res.message);

        return new Observable((observer) => {
            observer.error(res);
        });
    }
}
