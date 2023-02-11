import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { Id, ISatellite, IUser } from 'shared/domain';
import { ProfileService } from '../profile.service';
import { RelationsService } from '../relations.service';

@Component({
    selector: 'app-tab-tracking',
    templateUrl: './tab-tracking.component.html',
    styleUrls: ['../tab.component.scss'],
})
export class TabTrackingComponent {
    satellites: ISatellite[] | undefined;
    canEdit = false;
    user: IUser | undefined;
    tracking: ISatellite[] | undefined;

    waiting = false;

    trackingSub: Subscription | undefined;
    userSub: Subscription | undefined;
    editSub: Subscription | undefined;
    satelliteSub: Subscription | undefined;

    constructor(private profileService: ProfileService, private relationsService: RelationsService) {}

    ngOnInit(): void {
        this.trackingSub = this.relationsService.tracking$.subscribe((tracking) => {
            this.tracking = tracking;
        });

        this.userSub = this.profileService.currentUser$.subscribe((user) => {
            this.user = user;
            this.getSatellites();
        });
        this.editSub = this.profileService.canEdit$.subscribe((canEdit) => {
            this.canEdit = canEdit;
        });
    }

    isTracking(satelliteId: Id | undefined) {
        return this.tracking?.some((sat) => sat.id === satelliteId);
    }

    track(satelliteId: Id) {
        this.waiting = true;
        this.profileService.trackSatellite(satelliteId).subscribe(() => {
            this.waiting = false;
        });
    }

    untrack(satelliteId: Id) {
        this.waiting = true;
        this.profileService.untrackSatellite(satelliteId).subscribe(() => {
            this.waiting = false;
        });
    }

    private getSatellites() {
        if (this.user?.username) {
            this.satelliteSub = this.profileService.getTracking(this.user.username).subscribe((satellites) => {
                if (satellites) this.satellites = satellites;
            });
        }
    }

    ngOnDestroy(): void {
        if (this.trackingSub) this.trackingSub.unsubscribe();
        if (this.userSub) this.userSub.unsubscribe();
        if (this.editSub) this.editSub.unsubscribe();
        if (this.satelliteSub) this.satelliteSub.unsubscribe();
    }
}
