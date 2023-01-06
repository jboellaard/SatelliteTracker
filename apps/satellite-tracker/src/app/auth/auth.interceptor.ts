import {
    HttpInterceptor,
    HttpRequest,
    HttpHandler,
    HttpEvent,
    HTTP_INTERCEPTORS,
    HttpErrorResponse,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, switchMap, tap } from 'rxjs';
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
                if (error instanceof HttpErrorResponse && error.status === 401) {
                    return this.handle401Error(authReq, next);
                }
                return next.handle(authReq);
            })
        );
    }

    private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return this.authService.refreshToken().pipe(
            switchMap((res) => {
                if (res.accessToken) {
                    return next.handle(request.clone({ setHeaders: { Authorization: `Bearer ${res.accessToken}` } }));
                } else {
                    console.log('Something went wrong');
                    return next.handle(request);
                }
            })
        );
    }
}

export const httpInterceptorProviders = [{ provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }];
