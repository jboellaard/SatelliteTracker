import {
    HttpInterceptor,
    HttpRequest,
    HttpHandler,
    HttpEvent,
    HTTP_INTERCEPTORS,
    HttpErrorResponse,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, switchMap, throwError } from 'rxjs';
import { SnackBarService } from '../utils/snack-bar.service';
import { AuthService } from './auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    constructor(private authService: AuthService, private snackBar: SnackBarService) {}

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        let authReq = req;
        const token = this.authService.getAccessToken();
        if (token && !req.headers.has('authorization')) {
            authReq = req.clone({ setHeaders: { authorization: `Bearer ${token}` } });
        }
        return next.handle(authReq).pipe(
            catchError((error) => {
                if (
                    error instanceof HttpErrorResponse &&
                    error.status === 401 &&
                    !req.url.includes('refresh') &&
                    !req.url.includes('login') &&
                    !req.url.includes('register')
                ) {
                    return this.handle401Error(authReq, next);
                }
                if ((error instanceof HttpErrorResponse && error.status === 0) || error.status === 500) {
                    this.snackBar.error('Server error. Please try again later.');
                    return throwError(() => new Error(error.error.message));
                }
                if (error instanceof HttpErrorResponse && error.status === 404) {
                    this.snackBar.error('Resource not found.');
                    return throwError(() => new Error(error.error.message));
                }
                return next.handle(authReq);
            })
        );
    }

    private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return this.authService.refreshToken().pipe(
            switchMap((res) => {
                if (res) {
                    if (res.result.accessToken) {
                        return next.handle(
                            request.clone({ setHeaders: { Authorization: `Bearer ${res.result.accessToken}` } })
                        );
                    } else {
                        return throwError(() => new Error('Could not refresh token'));
                    }
                } else {
                    return throwError(() => new Error('Could not refresh token'));
                }
            })
        );
    }
}

export const httpInterceptorProviders = [{ provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }];
