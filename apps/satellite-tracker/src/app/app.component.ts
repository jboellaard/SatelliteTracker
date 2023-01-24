import { Component, OnInit } from '@angular/core';
import { UserIdentity } from 'shared/domain';
import { AuthService } from './auth/auth.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
    title = 'satellite-tracker';
    user: UserIdentity | undefined;

    constructor(public authService: AuthService) {}

    ngOnInit(): void {
        this.authService.getUser().subscribe((user) => {
            this.user = user;
        });
    }
}
