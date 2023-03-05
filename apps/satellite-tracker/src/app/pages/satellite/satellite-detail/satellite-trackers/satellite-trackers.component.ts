import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'apps/satellite-tracker/src/app/auth/auth.service';
import { ProfileService } from 'apps/satellite-tracker/src/app/profile/profile.service';
import { RelationsService } from 'apps/satellite-tracker/src/app/profile/relations.service';
import { DeleteDialogComponent } from 'apps/satellite-tracker/src/app/utils/delete-dialog/delete-dialog.component';
import { SnackBarService } from 'apps/satellite-tracker/src/app/utils/snack-bar.service';
import { Subscription } from 'rxjs';
import { Id, ISatellite, ICustomSatellitePart, UserIdentity, IUser } from 'shared/domain';
import { OrbitService } from '../../orbit-scene.service';
import { SatelliteService } from '../../satellite.service';

@Component({
    selector: 'app-satellite-trackers',
    templateUrl: './satellite-trackers.component.html',
    styleUrls: ['../satellite-detail.component.scss'],
})
export class SatelliteTrackersComponent {
    userId: Id | undefined;
    username: string | null | undefined;
    id: Id | null | undefined;
    satellite: ISatellite | undefined;

    loggedInUser: UserIdentity | undefined;
    tracking: ISatellite[] | undefined;
    following: IUser[] | undefined;
    canEdit = false;

    waiting = false;

    loggedInUserSub: Subscription | undefined;
    trackingSub: Subscription | undefined;
    followingSub: Subscription | undefined;
    userSub: Subscription | undefined;
    satelliteSub: Subscription | undefined;

    trackers: IUser[] | undefined;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private satelliteService: SatelliteService,
        public orbitService: OrbitService,
        private relationsService: RelationsService,
        private profileService: ProfileService,
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
        this.followingSub = this.relationsService.following$.subscribe((following) => {
            this.following = following;
        });

        this.route.paramMap.subscribe((params) => {
            this.satellite = undefined;
            this.id = params.get('satelliteId');
            if (this.id) {
                this.getSatellite();
                this.satelliteService.getRefreshRequired().subscribe(() => {
                    this.getSatellite();
                });
            } else {
                this.router.navigate([`/profile/${this.username}/`]);
            }
        });
    }

    private getSatellite() {
        this.satelliteSub = this.satelliteService.getById(this.id).subscribe((satellite) => {
            if (satellite) {
                this.satellite = satellite;
                this.getTrackers();
                this.username = satellite.createdBy
                if (this.username == this.loggedInUser?.username) {
                    this.canEdit = true;
                }
            } else {
                this.router.navigate([`/profile/${this.username}/`]);
            }
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
                this.satelliteService.delete(this.id!).subscribe((result) => {
                    if (result) {
                        this.relationsService
                            .getTracking()
                            .subscribe((tracking) => this.relationsService.tracking$.next(tracking));
                        this.snackBar.success('Satellite successfully deleted');
                        this.router.navigate([`/profile/${this.username}/`]);
                    } else {
                        this.snackBar.error('Something went wrong, please try again later');
                    }
                });
            }
        });
    }

    isTracking() {
        return this.tracking?.some((sat) => sat.id === this.satellite?.id);
    }

    track() {
        this.waiting = true;
        this.profileService.trackSatellite(this.satellite?.id).subscribe(() => {
            this.waiting = false;
            this.getTrackers();
        });
    }

    untrack() {
        this.waiting = true;
        this.profileService.untrackSatellite(this.satellite?.id).subscribe(() => {
            this.waiting = false;
            this.getTrackers();
        });
    }

    getTrackers() {
        this.waiting = true;
        this.satelliteService.getTrackers(this.satellite?.id).subscribe((trackers) => {
            this.waiting = false;
            this.trackers = trackers;
        });
    }

    isFollowing(username: string | undefined) {
        return this.following?.some((user) => user.username == username);
    }

    follow(username: string) {
        this.waiting = true;
        this.profileService.followUser(username).subscribe(() => {
            this.waiting = false;
        });
    }

    unfollow(username: string) {
        this.waiting = true;
        this.profileService.unfollowUser(username).subscribe(() => {
            this.waiting = false;
        });
    }

    ngOnDestroy() {
        if (this.trackingSub) this.trackingSub.unsubscribe();
        if (this.userSub) this.userSub.unsubscribe();
        if (this.satelliteSub) this.satelliteSub.unsubscribe();
    }
}
