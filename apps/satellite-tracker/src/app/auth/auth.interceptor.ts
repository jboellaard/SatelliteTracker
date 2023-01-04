import {
    HttpInterceptor,
    HttpRequest,
    HttpHandler,
    HttpEvent,
    HTTP_INTERCEPTORS,
    HttpErrorResponse,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, switchMap } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    constructor(private authService: AuthService) {}

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        let authReq = req;
        const token = this.authService.getToken();
        if (token) {
            authReq = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
        }
        return next.handle(authReq).pipe(
            catchError((error) => {
                if (error instanceof HttpErrorResponse && !authReq.url.includes('login') && error.status === 401) {
                    return this.handle401Error(authReq, next);
                } else {
                    throw error;
                }
            })
        );
    }

    private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return this.authService.refreshToken().pipe(
            catchError((error) => {
                this.authService.logout();
                throw error;
            }),
            switchMap((res: any) => {
                const token = this.authService.getToken();
                const authReq = request.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
                return next.handle(authReq);
            })
        );
    }
}

export const httpInterceptorProviders = [{ provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }];
