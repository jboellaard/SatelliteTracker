import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ICustomSatellitePart, Id, ISatellite, Shape } from 'shared/domain';
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

    tracking: ISatellite[] | undefined;
    canEdit = false;

    waiting = false;

    trackingSub: Subscription | undefined;
    userSub: Subscription | undefined;
    satelliteSub: Subscription | undefined;

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
        this.trackingSub = this.relationsService.tracking$.subscribe((tracking) => {
            this.tracking = tracking;
        });

        this.userSub = this.authService.user$.subscribe((user) => {
            if (user) {
                this.userId = user.id;
            }
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
                console.log(satellite);
                this.satellite = satellite;
                this.satellite.id = satellite._id;
                this.username = (satellite.createdBy as any).username;
                if ((satellite.createdBy as any)._id == this.userId) {
                    this.canEdit = true;
                }
                if (this.satellite.orbit) {
                    this.addOrbitScene();
                }
                if (this.satellite.satelliteParts && this.satellite.satelliteParts.length > 0) {
                    this.currentPart = this.satellite.satelliteParts[0];
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
        const dialogRef = this.dialog.open(DeleteDialogComponent, {
            data: { message: 'Are you sure you want to delete this satellite?' },
            position: { left: 'calc(50% - 70px)' },
        });
        dialogRef.afterClosed().subscribe((ok) => {
            console.log(ok);
            if (ok == 'ok') {
                this.satelliteService.delete(this.id!).subscribe((result) => {
                    console.log(result);
                    if (result) {
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
        const dialogRef = this.dialog.open(DeleteDialogComponent, {
            data: { message: 'Are you sure you want to delete this orbit?' },
            position: { left: 'calc(50% - 70px)' },
        });
        dialogRef.afterClosed().subscribe((ok) => {
            console.log(ok);
            if (ok == 'ok') {
                this.satelliteService.deleteOrbit(this.id!).subscribe((result) => {
                    console.log(result);
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
