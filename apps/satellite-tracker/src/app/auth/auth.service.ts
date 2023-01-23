import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, Observable, of, switchMap, tap } from 'rxjs';
import { UserCredentials, UserIdentity, UserRegistration } from 'shared/domain';
import { environment } from 'apps/satellite-tracker/src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    private readonly headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    private readonly CURRENT_USER = 'currentUser';
    user$ = new BehaviorSubject<UserIdentity | undefined>(undefined);

    constructor(private http: HttpClient, private router: Router) {
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
            tap((res) => {
                console.log(res);
                if (res.accessToken) {
                    localStorage.setItem('access_token', res.accessToken);
                    localStorage.setItem('refresh_token', res.refreshToken);
                    this.saveUserToLocalStorage(res.user);
                    this.user$.next(res.user);
                    const expiresAt = this.getExpirationDate(res.refreshTokenExpiresIn);
                    localStorage.setItem('expires_at', JSON.stringify(expiresAt.valueOf()));
                    this.router.navigate(['/']);
                }
            }),
            catchError((err) => {
                console.log('login error', err);
                return of(undefined);
            })
        );
    }

    register(user: UserRegistration): Observable<UserRegistration | undefined> {
        return this.http
            .post<UserRegistration>(`${environment.API_URL}register`, { ...user }, { headers: this.headers })
            .pipe(
                tap((user) => {
                    return user;
                }),
                catchError((err) => {
                    console.log('register error', err);
                    return of(undefined);
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
        return new Date(JSON.parse(localStorage.getItem('expires_at') || '')).valueOf() > new Date().valueOf();
    }

    isLoggedOut(): boolean {
        return !this.isLoggedIn();
    }

    refreshToken(): Observable<any> {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken || this.isLoggedOut()) {
            return of(undefined);
        }
        return this.http
            .get<any>(`${environment.API_URL}token`, {
                headers: { authorization: `Bearer ${refreshToken}` },
            })
            .pipe(
                tap((res) => {
                    if (res.accessToken) {
                        localStorage.setItem('access_token', res.accessToken);
                        localStorage.setItem('refresh_token', res.refreshToken);
                        this.user$.next(res.user);
                        const expiresAt = this.getExpirationDate(res.refreshTokenExpiresIn);
                        localStorage.setItem('expires_at', JSON.stringify(expiresAt.valueOf()));
                    }
                    console.log(res);
                    return of(res);
                }),
                catchError((err) => {
                    console.log('refresh error', err);
                    return of(undefined);
                })
            );
    }
}
