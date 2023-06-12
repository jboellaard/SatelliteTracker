import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { getPeriod, ISatellite, Shape } from 'shared/domain';
import { AddEditDialogComponent } from '../../../utils/add-edit-dialog/add-edit-dialog.component';
import { SnackBarService } from '../../../utils/snack-bar.service';
import { OrbitService } from '../orbit-scene.service';
import { SatelliteService } from '../satellite.service';

@Component({
    selector: 'app-orbit-edit',
    templateUrl: './orbit-edit.component.html',
    styleUrls: ['./orbit-edit.component.scss'],
    providers: [OrbitService],
})
export class OrbitEditComponent implements OnInit {
    orbit = {
        semiMajorAxis: 2 * this.orbitService.earthRadius,
        eccentricity: 0,
        inclination: 0,
        longitudeOfAscendingNode: 0,
        argumentOfPerigee: 90,
        period: getPeriod(2 * this.orbitService.earthRadius),
    };
    satellite: ISatellite = {
        satelliteName: '',
        purpose: 'TBD',
        mass: 0,
        sizeOfBase: 0,
        colorOfBase: '#000000',
        shapeOfBase: Shape.Cube,
        orbit: this.orbit,
    };
    time = {
        hour: 0,
        minute: 0,
    };

    id: string | null | undefined;
    username: string | undefined;

    paramSub: Subscription | undefined;
    satelliteSub: Subscription | undefined;
    componentExists = false;

    scene = false;
    minAltitude = 0;
    maxEcc = 1;
    constructor(
        public orbitService: OrbitService,
        private router: Router,
        private route: ActivatedRoute,
        private satelliteService: SatelliteService,
        private snackBar: SnackBarService,
        private dialog: MatDialog
    ) {
        this.minAltitude = this.orbitService.earthRadius + 30;
        this.maxEcc = Math.floor(1000 * (1 - this.minAltitude / this.orbitService.maxSMAEarth)) / 1000;
    }

    ngOnInit(): void {
        this.paramSub = this.route.paramMap.subscribe((params) => {
            this.id = params.get('satelliteId');
            this.username = params.get('username')!;
            if (this.id) {
                this.satelliteSub = this.satelliteService.getById(this.id).subscribe((satellite) => {
                    if (satellite) {
                        this.satellite = satellite;
                        if (this.satellite.orbit) {
                            this.componentExists = true;
                            if (this.satellite.orbit.dateTimeOfLaunch) {
                                this.time = {
                                    hour: new Date(this.satellite.orbit.dateTimeOfLaunch).getHours(),
                                    minute: new Date(this.satellite.orbit.dateTimeOfLaunch).getMinutes(),
                                };
                            }
                        } else {
                            this.satellite.orbit = this.orbit;
                        }
                        this.addOrbitScene();
                    } else {
                        this.snackBar.error('Could not find a satellite with this id');
                        this.router.navigate(['../'], { relativeTo: this.route });
                    }
                });
            } else {
                this.snackBar.error('Not a valid route');
                this.router.navigate(['../'], { relativeTo: this.route });
            }
        });
    }

    addOrbitScene() {
        setTimeout(() => {
            let canvas = document.querySelector('#canvas-wrapper canvas');
            this.orbitService.createOrbitScene(canvas ? canvas : document.body, this.satellite.orbit!, this.satellite);
            this.changeOrbitSize();
            if (this.orbitService.displayRealSize) {
                this.orbitService.displayRealSize = false;
            }
            this.changeSizeSatellite();
            document
                .querySelector('input#semimajoraxis')!
                .setAttribute('max', this.orbitService.maxSMAEarth.toFixed(0));
            document
                .querySelector('input#semimajoraxis')!
                .setAttribute('maxlength', this.orbitService.maxSMAEarth.toFixed(0).length.toString());
            document.querySelector('input#eccentricity-slider')!.setAttribute('max', this.maxEcc.toFixed(3));
        }, 0);
    }

    private getMinSemiMajorAxis() {
        let minSemiMajorAxis = this.minAltitude;
        if (this.satellite.orbit) {
            if (!this.satellite.orbit.eccentricity) this.satellite.orbit.eccentricity = 0;
            minSemiMajorAxis = Math.max(
                this.minAltitude / (1 - this.satellite.orbit.eccentricity),
                this.minAltitude / Math.sqrt(1 - this.satellite.orbit.eccentricity ** 2)
            );
        }
        return Math.round(minSemiMajorAxis);
    }

    /*
     * Change semimajor axis when eccentricity changes (if semimajor axis is too small)
     */
    changeEccentricity() {
        if (this.satellite.orbit) {
            if (!this.satellite.orbit.eccentricity) this.satellite.orbit.eccentricity = 0;
            const minSMA = this.getMinSemiMajorAxis();
            let sma = this.satellite.orbit.semiMajorAxis;
            if (minSMA == Infinity || minSMA > this.orbitService.maxSMAEarth) {
                sma = this.orbitService.maxSMAEarth;
                this.satellite.orbit.eccentricity = this.maxEcc;
            } else if (sma < minSMA) {
                sma = minSMA;
            }

            this.satellite.orbit.semiMajorAxis = sma;
            this.changeOrbitSize(minSMA);
        }
    }

    changeSemimajorAxis() {
        if (this.satellite.orbit) {
            this.satellite.orbit.semiMajorAxis = Math.round(this.satellite.orbit.semiMajorAxis);
            if (!this.satellite.orbit.eccentricity) this.satellite.orbit.eccentricity = 0;
            if (this.satellite.orbit.eccentricity > this.maxEcc) {
                this.satellite.orbit.eccentricity = Number(this.maxEcc.toFixed(3));
            }
            this.changeOrbitSize();
        }
    }

    getPeriodOrbit(sma: number) {
        return Number((getPeriod(sma * 1000) / (24 * 60 * 60)).toFixed(3));
    }

    changeOrbitSize(minSMA = this.getMinSemiMajorAxis()) {
        if (this.satellite.orbit) {
            if (this.satellite.orbit.semiMajorAxis < minSMA) {
                this.satellite.orbit.semiMajorAxis = minSMA;
            } else if (this.satellite.orbit.semiMajorAxis > this.orbitService.maxSMAEarth) {
                this.satellite.orbit.semiMajorAxis = this.orbitService.maxSMAEarth;
            }
            document.querySelector('input#semimajoraxis')!.setAttribute('min', minSMA.toFixed(0));

            this.satellite.orbit.period = this.getPeriodOrbit(this.satellite.orbit.semiMajorAxis);
            this.orbitService.changeEllipseGeometry(this.satellite.orbit);
            this.orbitService.changeEllipseRotation(this.satellite.orbit);
        }
    }

    changeAngle() {
        if (this.satellite.orbit) {
            this.orbitService.changeEllipseRotation(this.satellite.orbit);
        }
    }

    changeColorSatellite() {
        if (this.satellite.orbit) {
            this.orbitService.changeColorSatellite(this.satellite.colorOfBase);
        }
    }

    changeSizeSatellite() {
        if (this.satellite.orbit) {
            this.orbitService.changeSizeSatellite(this.satellite.sizeOfBase);
        }
    }

    dateChanged(date: string): Date {
        return new Date(date);
    }

    onSubmit() {
        if (this.satellite.orbit?.dateTimeOfLaunch) {
            this.satellite.orbit.dateTimeOfLaunch = new Date(this.satellite.orbit.dateTimeOfLaunch);
            this.satellite.orbit?.dateTimeOfLaunch.setHours(this.time.hour, this.time.minute);
        }
        let position = {};
        if (window.innerWidth > 780) {
            position = { left: 'calc(50% - 70px)' };
        }
        if (this.componentExists) {
            const dialogRef = this.dialog.open(AddEditDialogComponent, {
                data: { message: 'Are you sure you want to update this orbit?' },
                position,
            });
            dialogRef.afterClosed().subscribe((ok: string) => {
                if (ok == 'ok') {
                    this.satelliteService
                        .updateOrbit(this.satellite.id, this.satellite.orbit!)
                        .subscribe((satellite) => {
                            if (satellite) {
                                this.snackBar.success('Orbit updated successfully');
                                this.router.navigate(['/users/' + this.username + '/satellites/' + satellite?.id]);
                            } else {
                                this.snackBar.error('Orbit could not be updated');
                            }
                        });
                }
            });
        } else {
            const dialogRef = this.dialog.open(AddEditDialogComponent, {
                data: { message: 'Are you sure you want to create this orbit?' },
                position,
            });
            dialogRef.afterClosed().subscribe((ok: string) => {
                if (ok == 'ok') {
                    this.satelliteService.addOrbit(this.satellite.id, this.satellite.orbit!).subscribe((satellite) => {
                        if (satellite) {
                            this.snackBar.success('Orbit created successfully');
                            this.router.navigate(['/users/' + this.username + '/satellites/' + satellite?.id]);
                        } else {
                            this.snackBar.error('Orbit could not be created');
                        }
                    });
                }
            });
        }
    }

    backClicked() {
        this.router.navigate(['/users/' + this.username + '/satellites/' + this.id]);
    }

    ngOnDestroy() {
        if (this.paramSub) this.paramSub.unsubscribe();
        if (this.satelliteSub) this.satelliteSub.unsubscribe();
    }
}
