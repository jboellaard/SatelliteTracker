import { Component } from '@angular/core';
import { AuthService } from '../../../../auth/auth.service';
import { RelationsService } from '../../../../auth/relations.service';
import { Subscription } from 'rxjs';
import { ISatellite, UserIdentity, Id } from 'shared/domain';
import { DashboardService } from '../../dashboard.service';

@Component({
    selector: 'app-recent',
    templateUrl: './recent.component.html',
    styleUrls: ['../discover.component.scss'],
})
export class RecentComponent {
    satellites: ISatellite[] | undefined;
    satelliteSub: Subscription | undefined;

    loggedInUser: UserIdentity | undefined;
    loggedInUserSub: Subscription | undefined;
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
        this.trackingSub = this.relationsService.tracking$.subscribe((tracking) => {
            this.tracking = tracking;
        });
        this.satelliteSub = this.dashboardService.getRecentlyCreatedSatellites().subscribe((satellites) => {
            this.satellites = satellites;
            this.contentLoad = false;
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
        if (this.trackingSub) this.trackingSub.unsubscribe();
        if (this.satelliteSub) this.satelliteSub.unsubscribe();
    }
}
