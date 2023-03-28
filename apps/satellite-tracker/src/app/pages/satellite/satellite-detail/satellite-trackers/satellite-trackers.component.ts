import { Component } from '@angular/core';
import { AuthService } from '../../../../auth/auth.service';
import { RelationsService } from '../../../../auth/relations.service';
import { Subscription } from 'rxjs';
import { ISatellite, UserIdentity, IUser } from 'shared/domain';
import { OrbitService } from '../../orbit-scene.service';
import { SatelliteService } from '../../satellite.service';

@Component({
    selector: 'app-satellite-trackers',
    templateUrl: './satellite-trackers.component.html',
    styleUrls: ['../satellite-detail.component.scss'],
})
export class SatelliteTrackersComponent {
    username: string | null | undefined;
    satellite: ISatellite | undefined;

    loggedInUser: UserIdentity | undefined;
    tracking: ISatellite[] | undefined;
    following: IUser[] | undefined;

    waiting = false;

    loggedInUserSub: Subscription | undefined;
    trackingSub: Subscription | undefined;
    trackersSub: Subscription | undefined;
    followingSub: Subscription | undefined;
    satelliteSub: Subscription | undefined;

    trackers: IUser[] | undefined;

    constructor(
        private satelliteService: SatelliteService,
        public orbitService: OrbitService,
        private relationsService: RelationsService,
        private authService: AuthService
    ) {}

    ngOnInit(): void {
        this.loggedInUserSub = this.authService.user$.subscribe((user) => {
            if (user) {
                this.loggedInUser = user;
            }
        });

        this.followingSub = this.relationsService.following$.subscribe((following) => {
            this.following = following;
        });

        this.satelliteSub = this.satelliteService.currentSatellite$.subscribe((satellite) => {
            if (satellite) {
                this.satellite = satellite;
                this.username = satellite.createdBy;
                if (this.satelliteService.trackersOfCurrentSatellite$.value == undefined) {
                    this.satelliteService.getTrackers(this.satellite?.id).subscribe((trackers) => {
                        this.trackers = trackers;
                        this.satelliteService.trackersOfCurrentSatellite$.next(trackers);
                    });
                }
            }
        });

        this.trackersSub = this.satelliteService.trackersOfCurrentSatellite$.subscribe((trackers) => {
            this.trackers = trackers;
        });
    }

    getTrackers() {
        this.waiting = true;
        this.trackingSub = this.satelliteService.getTrackers(this.satellite?.id).subscribe((trackers) => {
            this.waiting = false;
            this.trackers = trackers;
            this.satelliteService.trackersOfCurrentSatellite$.next(trackers);
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

    ngOnDestroy() {
        if (this.loggedInUserSub) this.loggedInUserSub.unsubscribe();
        if (this.trackingSub) this.trackingSub.unsubscribe();
        if (this.followingSub) this.followingSub.unsubscribe();
        if (this.satelliteSub) this.satelliteSub.unsubscribe();
    }
}
