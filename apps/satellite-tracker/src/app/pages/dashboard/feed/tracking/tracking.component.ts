import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { FeedItem } from 'shared/domain';
import { DashboardService } from '../../dashboard.service';

@Component({
    selector: 'app-tracking',
    templateUrl: './tracking.component.html',
    styleUrls: ['../feed.component.scss'],
})
export class TrackingComponent implements OnInit, OnDestroy {
    trackingFeed: FeedItem[] | undefined;
    trackingFeedSub: Subscription | undefined;

    constructor(private dashboardService: DashboardService) {}

    ngOnInit(): void {
        this.trackingFeedSub = this.dashboardService.getSatelliteFeed().subscribe((feed) => {
            if (feed) this.trackingFeed = feed;
        });
    }

    ngOnDestroy(): void {
        if (this.trackingFeedSub) this.trackingFeedSub.unsubscribe();
    }
}
