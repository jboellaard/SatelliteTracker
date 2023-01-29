import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { UserIdentity } from 'shared/domain';
import { AuthService } from '../../auth/auth.service';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit{
    user: UserIdentity | undefined;
    tabs: Observable<{ label: string; content: string }[]>;

    constructor(private authService: AuthService) {
        this.tabs = new Observable((observer) => {
            observer.next([
                { label: 'Tab 1', content: 'Tab 1 content' },
                { label: 'Tab 2', content: 'Tab 2 content' },
                { label: 'Tab 3', content: 'Tab 3 content' },
            ]);
        });
    }

    ngOnInit(): void {
        this.authService.user$.subscribe((user) => {
            this.user = user;
        });
        if (this.user?.username) {
            
        }
    }
}
