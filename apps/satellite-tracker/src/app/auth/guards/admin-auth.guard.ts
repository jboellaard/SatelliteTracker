import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Injectable({
    providedIn: 'root',
})
export class AdminAuthGuard implements CanActivate {
    constructor(private authService: AuthService, private router: Router) {}

    canActivate() {
        if (this.authService.isLoggedIn()) {
            if (this.authService.user$.value?.roles?.includes('admin')) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }
}
