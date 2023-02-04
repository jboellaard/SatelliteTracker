import { Component } from '@angular/core';

@Component({
    selector: 'app-feed',
    templateUrl: './feed.component.html',
    styleUrls: ['./feed.component.scss'],
})
export class FeedComponent {
    tabs: { label: string; route: string }[] = [
        { label: 'Following', route: 'following' },
        { label: 'Tracked Satellites', route: 'tracked-satellites' },
    ];

    constructor() {}
}
