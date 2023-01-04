import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { UserCredentials, UserIdentity } from 'shared/domain';
import { environment } from 'apps/satellite-tracker/src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    private readonly headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    constructor(private http: HttpClient, private router: Router) {
        console.log('AuthService constructor ' + environment.API_URL);
    }

    login(credentials: UserCredentials) {
        return this.http.post<any>(`${environment.API_URL}login`, { ...credentials }, { headers: this.headers }).pipe(
            tap((res) => {
                console.log(res);
                if (res.token) {
                    localStorage.setItem('token', res.token);
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
        this.router.navigate(['/login']);
    }

    getToken(): string | null {
        return localStorage.getItem('token');
    }
}
