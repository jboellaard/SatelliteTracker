import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { FeedItem } from 'shared/domain';
import { DashboardService } from '../../dashboard.service';

@Component({
    selector: 'app-tracking',
    templateUrl: './tracking.component.html',
    styleUrls: ['../feed.component.scss', './tracking.component.scss'],
})
export class TrackingComponent implements OnInit {
    trackingFeed: FeedItem[] | undefined;
    trackingFeedSub: Subscription | undefined;
    constructor(private dashboardService: DashboardService) {}

    ngOnInit(): void {
        this.trackingFeedSub = this.dashboardService.getSatelliteFeed().subscribe((feed) => {
            console.log(feed);
            if (feed) this.trackingFeed = feed;
        });
    }
}
