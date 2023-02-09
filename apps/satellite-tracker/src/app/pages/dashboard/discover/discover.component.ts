import { Component } from '@angular/core';

@Component({
    selector: 'app-discover',
    templateUrl: '../dashboard.component.html',
    styleUrls: ['./discover.component.scss'],
})
export class DiscoverComponent {
    tabs: { label: string; route: string }[] = [
        { label: 'For you', route: 'for-you' },
        { label: 'Popular', route: 'popular' },
    ];

    constructor() {}
}
