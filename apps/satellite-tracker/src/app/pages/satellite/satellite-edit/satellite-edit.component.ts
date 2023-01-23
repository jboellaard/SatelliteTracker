import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Id, IOrbit, ISatellite, ISatellitePart, Purpose, Shape } from 'shared/domain';
import { SatelliteService } from '../satellite.service';
import { OrbitService } from '../orbit-scene.service';
import { AddPurposeDialogComponent } from './add-purpose-dialog/add-purpose-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
    selector: 'app-satellite-edit',
    templateUrl: './satellite-edit.component.html',
    styleUrls: ['./satellite-edit.component.scss'],
})
export class SatelliteEditComponent implements OnInit, OnDestroy {
    componentId: string | null | undefined;
    componentExists = false;
    id!: Id | null | undefined;
    allSatelliteParts: ISatellitePart[] = [];
    purposes = Purpose;
    shapes = Object.values(Shape);
    satellite: ISatellite = {
        satelliteName: '',
        purpose: 'TBD',
        mass: 0,
        sizeOfBase: 0,
        colorOfBase: '#000000',
        shapeOfBase: Shape.Cube,
        orbit: undefined,
    };
    userId!: Id | null | undefined;
    username: string | undefined;
    userSub: Subscription | undefined;
    satelliteSub: Subscription | undefined;
    satellitePartSub: Subscription | undefined;

    paramSub: Subscription | undefined;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private satelliteService: SatelliteService,
        public orbitService: OrbitService,
        public dialog: MatDialog
    ) {}

    ngOnInit(): void {
        this.satellitePartSub = this.satelliteService.getSatelliteParts().subscribe((satelliteParts) => {
            this.allSatelliteParts = satelliteParts.sort((a, b) => a.partName.localeCompare(b.partName));
        });
        this.paramSub = this.route.paramMap.subscribe((params) => {
            this.id = params.get('satelliteId')!;
            this.username = params.get('username')!;
            if (this.id) {
                this.componentExists = true;
                this.satelliteSub = this.satelliteService.getById(this.id).subscribe((satellite) => {
                    if (satellite) {
                        this.satellite = { ...satellite };
                        this.satellite.id = this.satellite._id;
                        if (this.satellite.purpose && this.purposes.indexOf(this.satellite.purpose) == -1) {
                            this.purposes.push(this.satellite.purpose);
                        }
                        if (this.satellite.orbit) {
                            this.satellite.orbit.period = Number(this.satellite.orbit.period?.toFixed(3));
                            this.satellite.orbit.semiMajorAxis = Math.round(this.satellite.orbit.semiMajorAxis);
                        }
                    }
                });
            }
        });
    }

    changeColorSatellite() {
        if (this.satellite.orbit) {
            this.orbitService.changeColorSatellite(this.satellite.colorOfBase);
        }
    }

    openDialog() {
        const dialogRef = this.dialog.open(AddPurposeDialogComponent);
        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.purposes.push(result);
            }
        });
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
        if (this.satellitePartSub) this.satellitePartSub.unsubscribe();
    }
}
