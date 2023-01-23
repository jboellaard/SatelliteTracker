import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IOrbit, ISatellite } from 'shared/domain';
import { OrbitService } from '../orbit-scene.service';

@Component({
    selector: 'app-orbit-edit',
    templateUrl: './orbit-edit.component.html',
    styleUrls: ['./orbit-edit.component.scss'],
})
export class OrbitEditComponent {
    orbit: IOrbit;
    colorOfBase = '#000000';

    scene = false;
    minAltitude = 0;
    constructor(public orbitService: OrbitService) {
        this.minAltitude = this.orbitService.earthRadius + 30;
        this.orbit = {
            semiMajorAxis: 2 * this.orbitService.earthRadius,
            eccentricity: 0,
            inclination: 0,
            longitudeOfAscendingNode: 0,
            argumentOfPerigee: 90,
            period: this.getPeriod(2 * this.orbitService.earthRadius),
        };
    }

    addOrbitScene() {
        setTimeout(() => {
            let canvas = document.querySelector('#canvas-wrapper canvas');
            this.orbitService.createOrbitScene(canvas ? canvas : document.body, this.orbit!, this.colorOfBase);
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
        if (this.orbit) {
            if (!this.orbit.eccentricity) this.orbit.eccentricity = 0;
            minSemiMajorAxis = Math.max(
                this.minAltitude / (1 - this.orbit.eccentricity),
                this.minAltitude / Math.sqrt(1 - this.orbit.eccentricity ** 2)
            );
        }
        return Math.round(minSemiMajorAxis);
    }

    getMaxEccentricity() {
        if (this.orbit) {
            return Math.max(
                1 - this.minAltitude / this.orbit.semiMajorAxis,
                1 / Math.sqrt((this.orbit.semiMajorAxis / (this.orbit.semiMajorAxis - this.minAltitude)) ** 2 + 1)
            );
        }
        return 1;
    }

    private getG() {
        return 5.9722 * Math.pow(10, 24) * 6.6743 * Math.pow(10, -11);
    }

    changeEccentricity() {
        if (this.orbit) {
            const maxEccentricity = this.getMaxEccentricity();
            if (!this.orbit.eccentricity) this.orbit.eccentricity = 0;
            const minSMA = this.getMinSemiMajorAxis();
            let sma = this.orbit.semiMajorAxis;
            if (minSMA == Infinity || minSMA > this.orbitService.maxSMAEarth) {
                sma = this.orbitService.maxSMAEarth;
                this.orbit.eccentricity = maxEccentricity;
            } else if (sma < minSMA) {
                sma = minSMA;
            }

            this.orbit.semiMajorAxis = sma;
            this.changeOrbitSize(maxEccentricity, minSMA);
        }
    }

    changeSemimajorAxis() {
        if (this.orbit) {
            const maxEccentricity = this.getMaxEccentricity();
            this.orbit.semiMajorAxis = Math.round(this.orbit.semiMajorAxis);
            if (!this.orbit.eccentricity) this.orbit.eccentricity = 0;
            if (this.orbit.eccentricity > maxEccentricity) {
                this.orbit.eccentricity = Number(maxEccentricity.toFixed(2));
            }
            this.changeOrbitSize(maxEccentricity);
        }
    }

    getPeriod(sma: number) {
        return Number(((2 * Math.PI * Math.sqrt((sma * 1000) ** 3 / this.getG())) / (24 * 60 * 60)).toFixed(3));
    }

    changeOrbitSize(maxEccentricity = this.getMaxEccentricity(), minSMA = this.getMinSemiMajorAxis()) {
        if (this.orbit) {
            document
                .querySelector('mat-slider#mat-eccentricity-slider')!
                .setAttribute('max', maxEccentricity.toString());
            document.querySelector('input#semimajoraxis')!.setAttribute('min', minSMA.toFixed(0));

            this.orbit.period = this.getPeriod(this.orbit.semiMajorAxis);
            this.orbitService.changeEllipseGeometry(this.orbit);
            this.orbitService.changeEllipseRotation(this.orbit);
        }
    }

    changeAngle() {
        if (this.orbit) {
            this.orbitService.changeEllipseRotation(this.orbit);
        }
    }

    dateChanged(date: string): Date {
        return new Date(date);
    }

    showOrbit() {
        if (!this.orbit) {
            this.orbit = {
                semiMajorAxis: 2 * this.orbitService.earthRadius,
                eccentricity: 0,
                inclination: 0,
                argumentOfPerigee: 90,
                longitudeOfAscendingNode: 0,
                period: this.getPeriod(2 * this.orbitService.earthRadius),
            } as IOrbit;
            this.addOrbitScene();
        }
    }
}
