import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { getPeriod, IOrbit, ISatellite, Shape } from 'shared/domain';
import { SnackBarService } from '../../../utils/snack-bar.service';
import { OrbitService } from '../orbit-scene.service';
import { SatelliteService } from '../satellite.service';

@Component({
    selector: 'app-orbit-edit',
    templateUrl: './orbit-edit.component.html',
    styleUrls: ['./orbit-edit.component.scss'],
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

    id: string | null | undefined;
    username: string | undefined;

    paramSub: Subscription | undefined;
    satelliteSub: Subscription | undefined;
    componentExists = false;

    scene = false;
    minAltitude = 0;
    constructor(
        public orbitService: OrbitService,
        private router: Router,
        private route: ActivatedRoute,
        private satelliteService: SatelliteService,
        private snachBarService: SnackBarService
    ) {
        this.minAltitude = this.orbitService.earthRadius + 30;
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
                        } else {
                            this.satellite.orbit = this.orbit;
                        }
                        this.addOrbitScene();
                    } else {
                        this.snachBarService.error('Could not find a satellite with this id');
                        this.router.navigate(['../'], { relativeTo: this.route });
                    }
                });
            } else {
                this.snachBarService.error('Could not find a satellite with this id');
                this.router.navigate(['../'], { relativeTo: this.route });
            }
        });
    }

    addOrbitScene() {
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
                .setAttribute('maxlength', this.orbitService.maxSMAEarth.toFixed(0).length.toString());
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

    getPeriodOrbit(sma: number) {
        return Number((getPeriod(sma * 1000) / (24 * 60 * 60)).toFixed(3));
    }

    changeOrbitSize(maxEccentricity = this.getMaxEccentricity(), minSMA = this.getMinSemiMajorAxis()) {
        if (this.satellite.orbit) {
            document
                .querySelector('mat-slider#mat-eccentricity-slider')!
                .setAttribute('max', maxEccentricity.toString());
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

    dateChanged(date: string): Date {
        return new Date(date);
    }
}
