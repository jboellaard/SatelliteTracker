import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Id, ISatellite, Shape } from 'shared/domain';
import { AuthService } from '../../../auth/auth.service';
import { DeleteDialogComponent } from '../../../utils/delete-dialog/delete-dialog.component';
import { SnackBarService } from '../../../utils/snack-bar.service';
import { UserService } from '../../user/user.service';
import { OrbitService } from '../orbit-scene.service';
import { SatelliteService } from '../satellite.service';

@Component({
    selector: 'app-satellite-detail',
    templateUrl: './satellite-detail.component.html',
    styleUrls: ['./satellite-detail.component.scss'],
})
export class SatelliteDetailComponent implements OnInit {
    userId: Id | undefined;
    username: string | null | undefined;
    id: Id | null | undefined;
    satellite: ISatellite | undefined;
    userSub: Subscription | undefined;
    satelliteSub: Subscription | undefined;
    canEdit = false;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        public userService: UserService,
        public satelliteService: SatelliteService,
        private orbitService: OrbitService,
        private authService: AuthService,
        public dialog: MatDialog,
        public snackBar: SnackBarService
    ) {}

    ngOnInit(): void {
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
                this.username = params.get('username')!;
            } else {
                this.router.navigate([`/users/${this.username}/`]);
            }
        });
    }

    private getSatellite() {
        this.satelliteSub = this.satelliteService.getById(this.id).subscribe((satellite) => {
            if (satellite) {
                this.satellite = satellite;
                this.satellite.id = satellite._id;
                if (this.satellite.createdBy == this.userId) {
                    this.canEdit = true;
                }
                if (this.satellite.orbit) {
                    this.addOrbitScene();
                }
            } else this.router.navigate([`/users/${this.username}/`]);
        });
    }

    addOrbitScene() {
        if (this.satellite?.orbit && this.satellite?.colorOfBase) {
            setTimeout(() => {
                let canvas = document.querySelector('#canvas-wrapper canvas');
                this.orbitService.createOrbitScene(
                    canvas ? canvas : document.body,
                    this.satellite?.orbit!,
                    this.satellite?.colorOfBase
                );
            }, 0);
        }
    }

    removeSatellite() {
        const dialogRef = this.dialog.open(DeleteDialogComponent, {
            data: { message: 'Are you sure you want to delete this satellite?' },
        });
        dialogRef.afterClosed().subscribe((ok) => {
            console.log(ok);
            if (ok == 'ok') {
                this.satelliteService.delete(this.id!).subscribe((result) => {
                    console.log(result);
                    if (result) {
                        this.snackBar.success('Satellite successfully deleted');
                        this.router.navigate([`/users/${this.username}/`]);
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
}
