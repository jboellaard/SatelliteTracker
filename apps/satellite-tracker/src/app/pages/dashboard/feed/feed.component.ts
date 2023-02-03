import { Component, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { UserIdentity, FeedItem } from 'shared/domain';
import { AuthService } from '../../../auth/auth.service';
import { DashboardService } from '../dashboard.service';

@Component({
    selector: 'app-feed',
    templateUrl: './feed.component.html',
    styleUrls: ['./feed.component.scss'],
})
export class FeedComponent implements OnInit {
    user: UserIdentity | undefined;
    followingFeedSub: Subscription | undefined;
    satelliteFeedSub: Subscription | undefined;
    followingFeed$: Observable<FeedItem[] | any[]> | undefined;
    satelliteFeed$: Observable<FeedItem[] | any[]> | undefined;

    tabs: { label: string; route: string }[] = [
        { label: 'Following', route: 'following' },
        { label: 'Tracked Satellites', route: 'tracked-satellites' },
    ];

    constructor(private authService: AuthService, private dashboardService: DashboardService) {}

    ngOnInit(): void {
        this.authService.user$.subscribe((user) => {
            this.user = user;
        });

        this.satelliteFeedSub = this.dashboardService.getSatelliteFeed().subscribe((feed) => {
            console.log(feed);
            this.satelliteFeed$ = feed;
        });
        console.log(this.followingFeed$);
    }
}
