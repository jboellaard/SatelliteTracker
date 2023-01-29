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
import { AuthService } from './auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    constructor(private authService: AuthService) {}

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
                return next.handle(authReq);
            })
        );
    }

    private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return this.authService.refreshToken().pipe(
            switchMap((res) => {
                console.log(res);
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
