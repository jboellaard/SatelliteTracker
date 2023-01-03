import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, map, Observable, of, tap } from 'rxjs';
import { Id, Token, UserCredentials, UserIdentity } from 'shared/domain';
import { environment } from 'apps/satellite-tracker/src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    // public currentUser$ = new BehaviorSubject<UserIdentity | undefined>(undefined);
    // private readonly CURRENT_USER = 'currentuser';
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
        // .pipe(
        //     map((token) => {
        //       localStorage.setItem('token', token.token);
        //     }),
        //     catchError((err) => {
        //         console.log('login error', err);
        //     })
        // );
    }

    register(user: UserIdentity): Observable<UserIdentity | undefined> {
        return this.http
            .post<UserIdentity>(`${environment.API_URL}register`, { ...user }, { headers: this.headers })
            .pipe(
                map((user) => {
                    // this.saveUserToLocalStorage(user);
                    // this.currenUser$.next(user);
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
        // this.router
        //     .navigate(['/'])
        //     .then((success) => {
        //         if (success) {
        //             localStorage.removeItem('token');
        //             // localStorage.removeItem(this.CURRENT_USER);
        //             // this.currentUser$.next(undefined);
        //         } else {
        //             console.log('Navigation to / failed');
        //         }
        //     })
        //     .catch((err) => {
        //         console.log('Logout failed', err);
        //     });
    }

    // getUserFromLocalStorage(): Observable<UserIdentity | undefined> {
    //     const user = localStorage.getItem(this.CURRENT_USER);
    //     if (user) {
    //         const localUser = JSON.parse(user);
    //         return of(localUser);
    //     } else {
    //         return of(undefined);
    //     }
    // }

    // private saveUserToLocalStorage(user: UserIdentity): void {
    //     localStorage.setItem(this.CURRENT_USER, JSON.stringify(user));
    // }

    // userMayEdit(itemUserId: Id): Observable<boolean> {
    //     return this.currentUser$.pipe(
    //         map((user: UserIdentity | undefined) =>
    //             user ? user.id === itemUserId || user.roles.includes('admin') : false
    //         )
    //     );
    // }

    getToken(): string | null {
        return localStorage.getItem('token');
    }
}
