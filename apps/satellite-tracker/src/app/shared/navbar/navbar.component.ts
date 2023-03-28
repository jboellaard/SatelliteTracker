import { Component, OnInit } from '@angular/core';
import { UserIdentity } from 'shared/domain';
import { AuthService } from '../../auth/auth.service';

@Component({
    selector: 'app-navbar',
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit {
    user: UserIdentity | undefined;

    constructor(private authService: AuthService) {}

    ngOnInit(): void {
        this.authService.user$.subscribe((user) => {
            this.user = user;
        });
    }

    logout() {
        this.authService.logout();
    }
}
