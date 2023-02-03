import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { FeedItem } from 'shared/domain';
import { DashboardService } from '../../dashboard.service';

@Component({
    selector: 'app-following',
    templateUrl: './following.component.html',
    styleUrls: ['../feed.component.scss', './following.component.scss'],
})
export class FollowingComponent implements OnInit {
    followingFeed: FeedItem[] | undefined;
    followingFeedSub: Subscription | undefined;
    constructor(private dashboardService: DashboardService) {}

    ngOnInit(): void {
        this.followingFeedSub = this.dashboardService.getFollowingFeed().subscribe((feed) => {
            console.log(feed);
            if (feed) this.followingFeed = feed;
        });
    }
}
