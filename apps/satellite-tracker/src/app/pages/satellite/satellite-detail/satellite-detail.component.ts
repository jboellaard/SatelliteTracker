import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ICustomSatellitePart, Id, ISatellite, IUser, Shape, UserIdentity } from 'shared/domain';
import { AuthService } from '../../../auth/auth.service';
import { ProfileService } from '../../../profile/profile.service';
import { RelationsService } from '../../../profile/relations.service';
import { DeleteDialogComponent } from '../../../utils/delete-dialog/delete-dialog.component';
import { SnackBarService } from '../../../utils/snack-bar.service';
import { OrbitService } from '../orbit-scene.service';
import { SatelliteService } from '../satellite.service';

@Component({
    selector: 'app-satellite-detail',
    templateUrl: './satellite-detail.component.html',
    styleUrls: ['./satellite-detail.component.scss'],
})
export class SatelliteDetailComponent implements OnInit, OnDestroy {
    userId: Id | undefined;
    username: string | null | undefined;
    id: Id | null | undefined;
    satellite: ISatellite | undefined;
    customPartTableColumns: string[] = ['position', 'name', 'color', 'size', 'quantity'];
    currentPart: ICustomSatellitePart | undefined;

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

    showTrackers = false;
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
            this.username = params.get('username');
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
        this.satelliteSub = this.satelliteService.getById(this.id).subscribe({
            next: (satellite) => {
                console.log(satellite);
                if (satellite) {
                    this.satellite = satellite;
                    this.username = satellite.createdBy;
                    if (this.username == this.loggedInUser?.username) this.canEdit = true;
                    if (this.satellite.orbit) this.addOrbitScene();
                    if (this.satellite.satelliteParts && this.satellite.satelliteParts.length > 0) {
                        this.currentPart = this.satellite.satelliteParts[0];
                    }
                } else {
                    this.router.navigate([`/profile/${this.username}/`]);
                }
            },
            error: (err) => {
                this.router.navigate([`/profile/${this.username}/`]);
            },
        });
    }

    isTracking() {
        return this.tracking?.some((sat) => sat.id === this.satellite?.id);
    }

    track() {
        this.waiting = true;
        this.profileService.trackSatellite(this.satellite?.id).subscribe(() => {
            this.waiting = false;
        });
    }

    untrack() {
        this.waiting = true;
        this.profileService.untrackSatellite(this.satellite?.id).subscribe(() => {
            this.waiting = false;
        });
    }

    addOrbitScene() {
        if (this.satellite?.orbit && this.satellite?.colorOfBase) {
            setTimeout(() => {
                let canvas = document.querySelector('#canvas-wrapper canvas');
                this.orbitService.createOrbitScene(
                    canvas ? canvas : document.body,
                    this.satellite?.orbit!,
                    this.satellite?.colorOfBase,
                    this.satellite?.shapeOfBase,
                    this.satellite?.sizeOfBase
                );
            }, 0);
        }
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

    removeOrbit() {
        let position = {};
        if (window.innerWidth > 780) {
            position = { left: 'calc(50% - 70px)' };
        }
        const dialogRef = this.dialog.open(DeleteDialogComponent, {
            data: { message: 'Are you sure you want to delete this orbit?' },
            position,
        });
        dialogRef.afterClosed().subscribe((ok) => {
            if (ok == 'ok') {
                this.satelliteService.deleteOrbit(this.id!).subscribe((result) => {
                    if (result) {
                        this.snackBar.success('Orbit successfully deleted');
                    } else {
                        this.snackBar.error('Something went wrong, please try again later');
                    }
                });
            }
        });
    }

    getContrastYIQ(hexcolor: string) {
        let r = parseInt(hexcolor.substring(1, 3), 16);
        let g = parseInt(hexcolor.substring(3, 5), 16);
        let b = parseInt(hexcolor.substring(5, 7), 16);
        let yiq = (r * 299 + g * 587 + b * 114) / 1000;
        return yiq >= 128 ? 'black' : 'white';
    }

    ngOnDestroy() {
        if (this.trackingSub) this.trackingSub.unsubscribe();
        if (this.userSub) this.userSub.unsubscribe();
        if (this.satelliteSub) this.satelliteSub.unsubscribe();
    }
}
