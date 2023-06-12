import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DeleteDialogComponent } from '../../../../utils/delete-dialog/delete-dialog.component';
import { SnackBarService } from '../../../../utils/snack-bar.service';
import { Subscription } from 'rxjs';
import { ISatellite, ICustomSatellitePart } from 'shared/domain';
import { OrbitService } from '../../orbit-scene.service';
import { SatelliteService } from '../../satellite.service';

@Component({
    selector: 'app-satellite-info',
    templateUrl: './satellite-info.component.html',
    styleUrls: ['../satellite-detail.component.scss'],
})
export class SatelliteInfoComponent {
    satellite: ISatellite | undefined;
    customPartTableColumns: string[] = ['position', 'name', 'color', 'size', 'quantity'];
    currentPart: ICustomSatellitePart | undefined;

    canEdit = false;

    editSub: Subscription | undefined;
    satelliteSub: Subscription | undefined;

    constructor(
        private satelliteService: SatelliteService,
        public orbitService: OrbitService,
        private dialog: MatDialog,
        private snackBar: SnackBarService
    ) {}

    ngOnInit(): void {
        this.satelliteSub = this.satelliteService.currentSatellite$.subscribe((satellite) => {
            if (satellite) {
                this.satellite = satellite;
                if (this.satellite.orbit) this.addOrbitScene();
                if (this.satellite.satelliteParts && this.satellite.satelliteParts.length > 0) {
                    this.currentPart = this.satellite.satelliteParts[0];
                }
                // this.changeSizeSatellite();
            }
        });

        this.editSub = this.satelliteService.canEdit$.subscribe((canEdit) => {
            this.canEdit = canEdit;
        });
    }

    addOrbitScene() {
        if (this.satellite && this.satellite?.orbit && this.satellite?.colorOfBase) {
            setTimeout(() => {
                let canvas = document.querySelector('#canvas-wrapper canvas');
                this.orbitService.createOrbitScene(
                    canvas ? canvas : document.body,
                    this.satellite?.orbit!,
                    this.satellite!
                );
                this.orbitService.changeZoom(this.satellite!.orbit!);
                if (this.orbitService.displayGuidelines) {
                    this.orbitService.displayGuidelines = false;
                    this.orbitService.toggleGuidelines();
                }
                if (
                    this.satellite?.sizeOfBase! >=
                    200000 * this.orbitService.scale * this.satellite!.orbit!.semiMajorAxis * 1.3
                ) {
                    this.orbitService.displayRealSize = true;
                } else {
                    this.orbitService.displayRealSize = false;
                }
                this.changeSizeSatellite();
            }, 0);
        }
    }

    changeSizeSatellite() {
        if (this.satellite && this.satellite?.orbit) {
            this.orbitService.changeSizeSatellite(this.satellite.sizeOfBase);
        }
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
                this.satelliteService.deleteOrbit(this.satellite?.id).subscribe((result) => {
                    if (result) {
                        this.satellite!.orbit = undefined;
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
        if (this.editSub) this.editSub.unsubscribe();
        if (this.satelliteSub) this.satelliteSub.unsubscribe();
    }
}
