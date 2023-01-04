import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, Observable, of, tap } from 'rxjs';
import { UserCredentials, UserIdentity } from 'shared/domain';
import { environment } from 'apps/satellite-tracker/src/environments/environment';
import * as moment from 'moment';

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    private readonly headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    username: string | null | undefined;
    admin: boolean | null | undefined;

    constructor(private http: HttpClient, private router: Router) {
        console.log('AuthService constructor ' + environment.API_URL);
    }

    login(credentials: UserCredentials) {
        return this.http.post<any>(`${environment.API_URL}login`, { ...credentials }, { headers: this.headers }).pipe(
            tap((res) => {
                console.log(res);
                if (res.token) {
                    localStorage.setItem('access_token', res.accessToken);
                    localStorage.setItem('refresh_token', res.refreshToken);
                    this.username = res.username;
                    this.admin = res.roles.includes('admin');
                    const expiresAt = moment().add(res.expiresIn, 'minute');
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

    register(user: UserIdentity): Observable<UserIdentity | undefined> {
        return this.http
            .post<UserIdentity>(`${environment.API_URL}register`, { ...user }, { headers: this.headers })
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
        localStorage.removeItem('token');
        localStorage.removeItem('expires_at');
        this.username = undefined;
        this.admin = undefined;
        this.router.navigate(['/login']);
    }

    getToken(): string | null {
        return localStorage.getItem('token');
    }

    isLoggedIn(): boolean {
        return moment().isBefore(this.getExpiration());
    }

    isLoggedOut(): boolean {
        return !this.isLoggedIn();
    }

    getExpiration(): moment.Moment {
        const expiration = localStorage.getItem('expires_at');
        const expiresAt = JSON.parse(expiration || '');
        return moment(expiresAt);
    }

    refreshToken(): Observable<any> {
        const refreshToken = localStorage.getItem('refresh_token');
        return this.http
            .post<any>(
                `${environment.API_URL}token`,
                { refreshToken },
                { headers: { Authorization: `Bearer ${refreshToken}` } }
            )
            .pipe(
                tap((res) => {
                    console.log(res);
                    if (res.token) {
                        localStorage.setItem('access_token', res.accessToken);
                        localStorage.setItem('refresh_token', res.refreshToken);
                        const expiresAt = moment().add(res.expiresIn, 'minute');
                        localStorage.setItem('expires_at', JSON.stringify(expiresAt.valueOf()));
                    }
                }),
                catchError((err) => {
                    console.log('refresh error', err);
                    return of(undefined);
                })
            );
    }
}
