import { Component } from '@angular/core';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent {
    tabs: Observable<{ label: string; content: string }[]>;

    constructor() {
        this.tabs = new Observable((observer) => {
            observer.next([
                { label: 'Tab 1', content: 'Tab 1 content' },
                { label: 'Tab 2', content: 'Tab 2 content' },
                { label: 'Tab 3', content: 'Tab 3 content' },
            ]);
        });
    }
}
