import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { Id, ISatellite, IUser } from 'shared/domain';
import { SatelliteService } from '../../pages/satellite/satellite.service';
import { DeleteDialogComponent } from '../../utils/delete-dialog/delete-dialog.component';
import { SnackBarService } from '../../utils/snack-bar.service';
import { ProfileService } from '../profile.service';
import { RelationsService } from '../relations.service';

@Component({
    selector: 'app-tab-created',
    templateUrl: './tab-created.component.html',
    styleUrls: ['../tab.component.scss'],
})
export class TabCreatedComponent implements OnInit {
    satellites: ISatellite[] | undefined;
    canEdit = false;
    user: IUser | undefined;
    tracking: ISatellite[] | undefined;

    waiting = false;

    trackingSub: Subscription | undefined;
    userSub: Subscription | undefined;
    editSub: Subscription | undefined;
    satelliteSub: Subscription | undefined;

    constructor(
        private profileService: ProfileService,
        private satelliteService: SatelliteService,
        private relationsService: RelationsService,
        public dialog: MatDialog,
        public snackBar: SnackBarService
    ) {}

    ngOnInit(): void {
        this.trackingSub = this.relationsService.tracking$.subscribe((tracking) => {
            this.tracking = tracking;
        });

        this.userSub = this.profileService.currentUser$.subscribe((user) => {
            this.satellites = undefined;
            this.user = user;
            this.getSatellites();
        });
        this.editSub = this.profileService.canEdit$.subscribe((canEdit) => {
            this.canEdit = canEdit;
            if (canEdit) {
                this.satelliteService.getRefreshRequired().subscribe(() => {
                    this.getSatellites();
                });
            }
        });
    }

    isTracking(satelliteId: Id | undefined) {
        return this.tracking?.some((sat) => sat.id === satelliteId);
    }

    private getSatellites() {
        if (this.user?.username) {
            this.satelliteSub = this.satelliteService
                .getSatellitesOfUserWithUsername(this.user.username)
                .subscribe((satellites) => {
                    if (satellites) this.satellites = satellites;
                    this.satellites?.forEach((satellite) => {
                        satellite.id = satellite._id;
                    });
                });
        }
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

    deleteSatellite(satelliteId: Id) {
        const dialogRef = this.dialog.open(DeleteDialogComponent, {
            data: { message: 'Are you sure you want to delete this satellite?' },
        });
        dialogRef.afterClosed().subscribe((ok) => {
            if (ok == 'ok') {
                this.waiting = true;
                this.satelliteService.delete(satelliteId).subscribe((result) => {
                    this.waiting = false;
                    if (result) {
                        this.snackBar.success('Satellite successfully deleted');
                    } else {
                        this.snackBar.error('Something went wrong, please try again later');
                    }
                });
            }
        });
    }

    ngOnDestroy(): void {
        if (this.trackingSub) this.trackingSub.unsubscribe();
        if (this.userSub) this.userSub.unsubscribe();
        if (this.editSub) this.editSub.unsubscribe();
        if (this.satelliteSub) this.satelliteSub.unsubscribe();
    }
}
