import { Component, OnDestroy, OnInit } from '@angular/core';
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

    semiMajorAxisWithoutEarthRadius = 0;
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
        this.route.paramMap.subscribe((params) => {
            this.id = params.get('satelliteId')!;
            this.username = params.get('username')!;
            if (this.id) {
                this.componentExists = true;
                this.satelliteSub = this.satelliteService.getById(this.id).subscribe((satellite) => {
                    if (satellite) {
                        this.satellite = { ...satellite };
                        this.satellite.id = this.satellite._id;
                        if (this.satellite.orbit) {
                            this.satellite.orbit.period = Number(this.satellite.orbit.period?.toFixed(3));
                            this.semiMajorAxisWithoutEarthRadius =
                                this.satellite.orbit.semiMajorAxis - this.orbitService.earthRadius;

                            const container = document.querySelector('#scene-container');
                            this.orbitService.createOrbitScene(
                                container ? container : document.body,
                                this.satellite.orbit,
                                this.satellite.colorOfBase
                            );
                        }
                    }
                });
            }
        });
    }

    private getMinSemiMajorAxis() {
        if (this.satellite.orbit) {
            if (!this.satellite.orbit.eccentricity) this.satellite.orbit.eccentricity = 0;
            return Math.max(
                this.minAltitude / (1 - this.satellite.orbit.eccentricity),
                this.minAltitude / Math.sqrt(1 - this.satellite.orbit.eccentricity ** 2)
            );
        }
        return this.minAltitude;
    }

    private getMaxEccentricity() {
        if (this.satellite.orbit) {
            return Math.max(
                1 - this.minAltitude / this.satellite.orbit.semiMajorAxis,
                Math.sqrt(1 - (this.satellite.orbit.semiMajorAxis / this.minAltitude) ** 2)
            );
        }
        return 1;
    }

    private getG() {
        return 5.9722 * Math.pow(10, 24) * 6.6743 * Math.pow(10, -11);
    }

    calculatePeriod() {
        if (this.satellite.orbit?.semiMajorAxis) {
            this.satellite.orbit.semiMajorAxis = this.semiMajorAxisWithoutEarthRadius + this.orbitService.earthRadius;
            if (this.satellite.orbit.semiMajorAxis < this.getMinSemiMajorAxis()) {
                this.satellite.orbit.semiMajorAxis = this.getMinSemiMajorAxis();
            }
            this.satellite.orbit.period = Number(
                (
                    (2 * Math.PI * Math.sqrt((this.satellite.orbit.semiMajorAxis * 1000) ** 3 / this.getG())) /
                    (24 * 60 * 60)
                ).toFixed(3)
            );
            this.semiMajorAxisWithoutEarthRadius = this.satellite.orbit.semiMajorAxis - this.orbitService.earthRadius;
            this.orbitService.changeEllipseGeometry(this.satellite.orbit);
        }
    }

    calculateSemiMajorAxis() {
        if (this.satellite.orbit?.period) {
            this.satellite.orbit.semiMajorAxis = Number(
                (
                    Math.cbrt((this.getG() * (this.satellite.orbit.period * 24 * 60 * 60) ** 2) / (4 * Math.PI ** 2)) /
                    1000
                ).toFixed(0)
            );
            if (this.satellite.orbit.semiMajorAxis < this.getMinSemiMajorAxis()) {
                this.satellite.orbit.semiMajorAxis = this.getMinSemiMajorAxis();
            }
            this.semiMajorAxisWithoutEarthRadius = this.satellite.orbit.semiMajorAxis - this.orbitService.earthRadius;
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
            if (!this.satellite.orbit.eccentricity) this.satellite.orbit.eccentricity = 0;
            if (this.satellite.orbit.eccentricity >= 0 && this.satellite.orbit.eccentricity <= 1) {
                const minSMA = this.getMinSemiMajorAxis();
                if (minSMA == Infinity || minSMA > this.orbitService.maxSMAEarth) {
                    this.satellite.orbit.semiMajorAxis = this.orbitService.maxSMAEarth;
                    this.satellite.orbit.eccentricity = this.getMaxEccentricity();
                    console.log(this.satellite.orbit.eccentricity);
                } else if (this.satellite.orbit.semiMajorAxis < minSMA) {
                    this.satellite.orbit.semiMajorAxis = minSMA;
                }
                this.semiMajorAxisWithoutEarthRadius =
                    this.satellite.orbit.semiMajorAxis - this.orbitService.earthRadius;
                this.orbitService.changeEllipseGeometry(this.satellite.orbit);
                this.orbitService.changeEllipseRotation(this.satellite.orbit);
            }
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
        if (this.userSub) this.userSub.unsubscribe();
        if (this.satelliteSub) this.satelliteSub.unsubscribe();
    }
}
