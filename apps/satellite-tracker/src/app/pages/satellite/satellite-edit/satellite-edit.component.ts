import { Component, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Id, ISatellite } from 'shared/domain';
import { SatelliteService } from '../satellite.service';
import { OrbitService } from '../orbit.service';

@Component({
    selector: 'app-satellite-edit',
    templateUrl: './satellite-edit.component.html',
    styleUrls: ['./satellite-edit.component.scss'],
})
export class SatelliteEditComponent implements OnInit, OnDestroy {
    componentId: string | null | undefined;
    componentExists = false;
    id!: Id | null | undefined;
    satellite: ISatellite = {
        satelliteName: '',
        purpose: '',
        mass: 0,
        sizeOfBase: 0,
        colorOfBase: '#000000',
        orbit: undefined,
    };
    userId!: Id | null | undefined;
    username: string | undefined;
    userSub: Subscription | undefined;
    satelliteSub: Subscription | undefined;

    paramSub: Subscription | undefined;
    scene = false;
    minAltitude = 0;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private satelliteService: SatelliteService,
        public orbitService: OrbitService
    ) {
        this.minAltitude = this.orbitService.earthRadius + 30;
    }

    ngOnInit(): void {
        this.paramSub = this.route.paramMap.subscribe((params) => {
            this.id = params.get('satelliteId')!;
            this.username = params.get('username')!;
            if (this.id) {
                this.componentExists = true;
                this.satelliteSub = this.satelliteService.getById(this.id).subscribe((satellite) => {
                    if (satellite) {
                        this.satellite = { ...satellite };
                        this.satellite.id = this.satellite._id;
                        if (this.satellite.orbit) {
                            this.scene = true;
                            this.satellite.orbit.period = Number(this.satellite.orbit.period?.toFixed(3));
                            this.satellite.orbit.semiMajorAxis = Math.round(this.satellite.orbit.semiMajorAxis);

                            setTimeout(() => {
                                let canvas = document.querySelector('#canvas-wrapper canvas');
                                this.orbitService.createOrbitScene(
                                    canvas ? canvas : document.body,
                                    this.satellite.orbit!,
                                    this.satellite.colorOfBase
                                );
                                this.changeOrbitSize();
                                document
                                    .querySelector('input#semimajoraxis')!
                                    .setAttribute('max', this.orbitService.maxSMAEarth.toFixed(0));
                                document
                                    .querySelector('input#semimajoraxis')!
                                    .setAttribute(
                                        'maxlength',
                                        this.orbitService.maxSMAEarth.toFixed(0).length.toString()
                                    );
                            }, 0);
                        }
                    }
                });
            }
        });
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

    getMaxEccentricity() {
        if (this.satellite.orbit) {
            return Math.max(
                1 - this.minAltitude / this.satellite.orbit.semiMajorAxis,
                1 /
                    Math.sqrt(
                        (this.satellite.orbit.semiMajorAxis /
                            (this.satellite.orbit.semiMajorAxis - this.minAltitude)) **
                            2 +
                            1
                    )
            );
        }
        return 1;
    }

    private getG() {
        return 5.9722 * Math.pow(10, 24) * 6.6743 * Math.pow(10, -11);
    }

    calculatePeriod() {
        if (this.satellite.orbit?.semiMajorAxis) {
            this.satellite.orbit.period = Number(
                (
                    (2 * Math.PI * Math.sqrt((this.satellite.orbit.semiMajorAxis * 1000) ** 3 / this.getG())) /
                    (24 * 60 * 60)
                ).toFixed(3)
            );
            this.orbitService.changeEllipseGeometry(this.satellite.orbit);
        }
    }

    changeInclination() {
        if (this.satellite.orbit) {
            this.orbitService.changeEllipseRotation(this.satellite.orbit);
        }
    }

    changeEccentricity() {
        if (this.satellite.orbit) {
            const maxEccentricity = this.getMaxEccentricity();
            if (!this.satellite.orbit.eccentricity) this.satellite.orbit.eccentricity = 0;
            const minSMA = this.getMinSemiMajorAxis();
            let sma = this.satellite.orbit.semiMajorAxis;
            if (minSMA == Infinity || minSMA > this.orbitService.maxSMAEarth) {
                sma = this.orbitService.maxSMAEarth;
                this.satellite.orbit.eccentricity = maxEccentricity;
            } else if (sma < minSMA) {
                sma = minSMA;
            }

            this.satellite.orbit.semiMajorAxis = sma;
            this.changeOrbitSize(maxEccentricity, minSMA);
        }
    }

    changeSemimajorAxis() {
        if (this.satellite.orbit) {
            const maxEccentricity = this.getMaxEccentricity();
            this.satellite.orbit.semiMajorAxis = Math.round(this.satellite.orbit.semiMajorAxis);
            if (!this.satellite.orbit.eccentricity) this.satellite.orbit.eccentricity = 0;
            if (this.satellite.orbit.eccentricity > maxEccentricity) {
                this.satellite.orbit.eccentricity = Number(maxEccentricity.toFixed(2));
            }
            this.changeOrbitSize(maxEccentricity);
        }
    }

    changeOrbitSize(maxEccentricity = this.getMaxEccentricity(), minSMA = this.getMinSemiMajorAxis()) {
        if (this.satellite.orbit) {
            document
                .querySelector('mat-slider#mat-eccentricity-slider')!
                .setAttribute('max', maxEccentricity.toString());
            document.querySelector('input#semimajoraxis')!.setAttribute('min', minSMA.toFixed(0));
            document
                .querySelector('input#semimajoraxis')!
                .setAttribute('minlength', minSMA.toFixed(0).length.toString());

            this.calculatePeriod();
            this.orbitService.changeEllipseRotation(this.satellite.orbit);
        }
    }

    changeColorSatellite() {
        if (this.satellite.orbit) {
            this.orbitService.changeColorSatellite(this.satellite.colorOfBase);
        }
    }

    changeAngle() {
        if (this.satellite.orbit) {
            this.orbitService.changeEllipseRotation(this.satellite.orbit);
        }
    }

    onSubmit() {
        console.log('Submitting the form');
        if (this.componentExists) {
            this.satelliteService.update(this.satellite!).subscribe((satellite) => {
                this.router.navigate(['/users/' + this.username + '/satellites/' + this.id]);
            });
        } else {
            this.satelliteService.create(this.satellite!).subscribe((satellite) => {
                this.satellite = { ...satellite };
                this.router.navigate(['/users/' + this.username + '/satellites/' + this.satellite._id]);
            });
        }
    }

    backClicked() {
        if (this.componentExists) {
            this.router.navigate(['/users/' + this.username + '/satellites/' + this.id]);
        } else {
            this.router.navigate(['/users/' + this.username]);
        }
    }

    ngOnDestroy() {
        if (this.paramSub) this.paramSub.unsubscribe();
        if (this.userSub) this.userSub.unsubscribe();
        if (this.satelliteSub) this.satelliteSub.unsubscribe();
    }
}
