import { Component } from '@angular/core';
import { getPeriod, ISatellite, Shape } from 'shared/domain';
import { OrbitService } from '../orbit-scene.service';

@Component({
    selector: 'app-orbit-simulation',
    templateUrl: './orbit-simulation.component.html',
    styleUrls: ['./orbit-simulation.component.scss', '../orbit-edit/orbit-edit.component.scss'],
})
export class OrbitSimulationComponent {
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
        mass: 100,
        sizeOfBase: 200,
        colorOfBase: '#ffffff',
        shapeOfBase: Shape.Cube,
        orbit: this.orbit,
    };

    shapes = Object.values(Shape);

    minAltitude = 0;
    maxEcc = 1;
    constructor(public orbitService: OrbitService) {
        this.minAltitude = this.orbitService.earthRadius + 30;
        this.maxEcc = Math.floor(1000 * (1 - this.minAltitude / this.orbitService.maxSMAEarth)) / 1000;
    }

    ngOnInit(): void {
        this.addOrbitScene();
    }

    addOrbitScene() {
        setTimeout(() => {
            let canvas = document.querySelector('#canvas-wrapper canvas');
            this.orbitService.createOrbitScene(canvas ? canvas : document.body, this.satellite.orbit!, this.satellite);
            this.changeOrbitSize();
            if (this.orbitService.realSize) {
                this.orbitService.realSize = false;
                this.orbitService.toggleSize();
            }
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

    onSubmit() {
        this.addOrbitScene();
    }
}
