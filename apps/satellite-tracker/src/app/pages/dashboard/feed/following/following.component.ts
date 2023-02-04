import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { FeedItem } from 'shared/domain';
import { DashboardService } from '../../dashboard.service';

@Component({
    selector: 'app-following',
    templateUrl: './following.component.html',
    styleUrls: ['../feed.component.scss'],
})
export class FollowingComponent implements OnInit, OnDestroy {
    followingFeed: FeedItem[] | undefined;
    followingFeedSub: Subscription | undefined;

    constructor(private dashboardService: DashboardService) {}

    ngOnInit(): void {
        this.followingFeedSub = this.dashboardService.getFollowingFeed().subscribe((feed) => {
            if (feed) this.followingFeed = feed;
        });
    }

    ngOnDestroy(): void {
        if (this.followingFeedSub) this.followingFeedSub.unsubscribe();
    }
}
