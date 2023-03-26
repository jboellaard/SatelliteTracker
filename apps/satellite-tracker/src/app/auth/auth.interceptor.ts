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
                if (error instanceof HttpErrorResponse && error.status === 500) {
                    this.snackBar.error('Something went wrong, please try again later');
                }
                if (error instanceof HttpErrorResponse && error.status === 0) {
                    this.snackBar.error('The server is not responding, please try again later');
                }
                return throwError(() => error);
            })
        );
    }

    private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return this.authService.refreshToken().pipe(
            switchMap((response) => {
                if (response) {
                    if (response.result.accessToken) {
                        return next.handle(
                            request.clone({ setHeaders: { Authorization: `Bearer ${response.result.accessToken}` } })
                        );
                    }
                }
                return throwError(() => new Error('Could not refresh token'));
            })
        );
    }
}

export const httpInterceptorProviders = [{ provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }];
