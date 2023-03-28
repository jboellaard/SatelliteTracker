import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '../../../../auth/auth.service';
import { RelationsService } from '../../../../auth/relations.service';
import { Subscription } from 'rxjs';
import { IUser, ISatellite, UserIdentity, Id } from 'shared/domain';
import { DashboardService } from '../../dashboard.service';

@Component({
    selector: 'app-popular',
    templateUrl: './popular.component.html',
    styleUrls: ['../discover.component.scss'],
})
export class PopularComponent implements OnInit, OnDestroy {
    creators: IUser[] | undefined;
    creatorSub: Subscription | undefined;
    satellites: ISatellite[] | undefined;
    satelliteSub: Subscription | undefined;

    loggedInUser: UserIdentity | undefined;
    loggedInUserSub: Subscription | undefined;
    following: IUser[] | undefined;
    followingSub: Subscription | undefined;
    tracking: ISatellite[] | undefined;
    trackingSub: Subscription | undefined;

    contentLoad = false;
    waiting = false;

    constructor(
        private authService: AuthService,
        private relationsService: RelationsService,
        private dashboardService: DashboardService
    ) {}

    ngOnInit(): void {
        this.contentLoad = true;
        this.loggedInUserSub = this.authService.user$.subscribe((user) => {
            this.loggedInUser = user;
        });

        this.followingSub = this.relationsService.following$.subscribe((following) => {
            this.following = following;
        });
        this.trackingSub = this.relationsService.tracking$.subscribe((tracking) => {
            this.tracking = tracking;
        });
        this.creatorSub = this.dashboardService.getPopularCreators().subscribe((creators) => {
            this.creators = creators;
            this.contentLoad = false;
        });
        this.satelliteSub = this.dashboardService.getPopularSatellites().subscribe((satellites) => {
            this.satellites = satellites;
            this.contentLoad = false;
        });
    }

    isFollowing(username: string | undefined) {
        return this.following?.some((user) => user.username == username);
    }

    follow(username: string) {
        this.waiting = true;
        this.relationsService.followUser(username).subscribe(() => {
            this.waiting = false;
        });
    }

    unfollow(username: string) {
        this.waiting = true;
        this.relationsService.unfollowUser(username).subscribe(() => {
            this.waiting = false;
        });
    }

    isTracking(satelliteId: Id | undefined) {
        return this.tracking?.some((sat) => sat.id === satelliteId);
    }

    track(satelliteId: Id) {
        this.waiting = true;
        this.relationsService.trackSatellite(satelliteId).subscribe(() => {
            this.waiting = false;
        });
    }

    untrack(satelliteId: Id) {
        this.waiting = true;
        this.relationsService.untrackSatellite(satelliteId).subscribe(() => {
            this.waiting = false;
        });
    }

    ngOnDestroy(): void {
        if (this.loggedInUserSub) this.loggedInUserSub.unsubscribe();
        if (this.followingSub) this.followingSub.unsubscribe();
        if (this.trackingSub) this.trackingSub.unsubscribe();
        if (this.creatorSub) this.creatorSub.unsubscribe();
        if (this.satelliteSub) this.satelliteSub.unsubscribe();
    }
}
