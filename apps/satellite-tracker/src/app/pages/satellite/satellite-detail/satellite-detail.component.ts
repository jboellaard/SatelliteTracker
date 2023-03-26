import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Id, ISatellite, UserIdentity } from 'shared/domain';
import { AuthService } from '../../../auth/auth.service';
import { RelationsService } from '../../../auth/relations.service';
import { DeleteDialogComponent } from '../../../utils/delete-dialog/delete-dialog.component';
import { SnackBarService } from '../../../utils/snack-bar.service';
import { SatelliteService } from '../satellite.service';

@Component({
    selector: 'app-satellite-detail',
    templateUrl: './satellite-detail.component.html',
    styleUrls: ['./satellite-detail.component.scss'],
})
export class SatelliteDetailComponent implements OnInit, OnDestroy {
    userId: Id | undefined;
    username: string | null | undefined;
    satellite: ISatellite | undefined;

    loggedInUser: UserIdentity | undefined;
    tracking: ISatellite[] | undefined;
    canEdit = false;

    waiting = false;

    loggedInUserSub: Subscription | undefined;
    trackingSub: Subscription | undefined;
    userSub: Subscription | undefined;
    satelliteSub: Subscription | undefined;

    constructor(
        private route: ActivatedRoute,
        public router: Router,
        private satelliteService: SatelliteService,
        private relationsService: RelationsService,
        private authService: AuthService,
        private dialog: MatDialog,
        private snackBar: SnackBarService
    ) {}

    ngOnInit(): void {
        this.loggedInUserSub = this.authService.user$.subscribe((user) => {
            if (user) {
                this.userId = user.id;
            }
            this.loggedInUser = user;
        });

        this.trackingSub = this.relationsService.tracking$.subscribe((tracking) => {
            this.tracking = tracking;
        });

        this.route.paramMap.subscribe((params) => {
            this.satellite = undefined;
            this.satelliteService.currentSatellite$.next(undefined);
            this.satelliteService.canEdit$.next(false);
            this.satelliteService.trackersOfCurrentSatellite$.next(undefined);
            let id = params.get('satelliteId');
            this.username = params.get('username');
            if (id) {
                this.getSatellite(id);
            } else {
                this.router.navigate([`/profile/${this.username}/`]);
            }
        });
    }

    private getSatellite(id: Id | null) {
        this.satelliteSub = this.satelliteService.getById(id).subscribe((satellite) => {
            if (satellite) {
                this.satelliteService.currentSatellite$.next(satellite);
                this.satellite = satellite;
                this.username = satellite.createdBy;
                if (this.username == this.loggedInUser?.username) {
                    this.satelliteService.canEdit$.next(true);
                    this.canEdit = true;
                } else {
                    this.satelliteService.canEdit$.next(false);
                    this.canEdit = false;
                }
            } else {
                this.router.navigate([`/profile/${this.username}/`]);
            }
        });
    }

    isTracking() {
        return this.tracking?.some((sat) => sat.id === this.satellite?.id);
    }

    track() {
        this.waiting = true;
        this.relationsService.trackSatellite(this.satellite?.id).subscribe(() => {
            this.waiting = false;
            this.satelliteService.getTrackers(this.satellite?.id).subscribe();
        });
    }

    untrack() {
        this.waiting = true;
        this.relationsService.untrackSatellite(this.satellite?.id).subscribe(() => {
            this.waiting = false;
            this.satelliteService.getTrackers(this.satellite?.id).subscribe();
        });
    }

    removeSatellite() {
        let position = {};
        if (window.innerWidth > 780) {
            position = { left: 'calc(50% - 70px)' };
        }
        const dialogRef = this.dialog.open(DeleteDialogComponent, {
            data: { message: 'Are you sure you want to delete this satellite?' },
            position,
        });
        dialogRef.afterClosed().subscribe((ok) => {
            if (ok == 'ok') {
                this.satelliteService.delete(this.satellite?.id).subscribe((result) => {
                    if (result as ISatellite) {
                        this.relationsService.getTracking().subscribe();
                        this.snackBar.success('Satellite successfully deleted');
                        this.router.navigate([`/profile/${this.username}/`]);
                    } else {
                        this.snackBar.error('Something went wrong, please try again later');
                    }
                });
            }
        });
    }

    ngOnDestroy() {
        this.satelliteService.currentSatellite$.next(undefined);
        this.satelliteService.canEdit$.next(false);
        this.satelliteService.trackersOfCurrentSatellite$.next(undefined);
        if (this.trackingSub) this.trackingSub.unsubscribe();
        if (this.userSub) this.userSub.unsubscribe();
        if (this.satelliteSub) this.satelliteSub.unsubscribe();
        if (this.loggedInUserSub) this.loggedInUserSub.unsubscribe();
    }
}
