import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ICustomSatellitePart, Id, IOrbit, ISatellite, ISatellitePart, Purpose, Shape } from 'shared/domain';
import { SatelliteService } from '../satellite.service';
import { OrbitService } from '../orbit-scene.service';
import { AddPurposeDialogComponent } from './add-purpose-dialog/add-purpose-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { SnackBarService } from '../../../utils/snack-bar.service';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { AddEditDialogComponent } from '../../../utils/add-edit-dialog/add-edit-dialog.component';
import { MatTable } from '@angular/material/table';

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
    satellitePartNames: string[] = [];
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
    username: string | undefined;

    userSub: Subscription | undefined;
    satelliteSub: Subscription | undefined;
    satellitePartSub: Subscription | undefined;
    paramSub: Subscription | undefined;

    @ViewChild('table', { static: true }) table?: MatTable<ICustomSatellitePart>;
    customPartTableColumns: string[] = ['position', 'name', 'color', 'size', 'quantity', 'actions'];
    dragDisabled = true;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private satelliteService: SatelliteService,
        public orbitService: OrbitService,
        public dialog: MatDialog,
        public snackBar: SnackBarService
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
                        if (!this.satellite.satelliteParts) this.satellite.satelliteParts = [];
                        if (this.satellite.purpose && this.purposes.indexOf(this.satellite.purpose) == -1) {
                            this.purposes.push(this.satellite.purpose);
                        }
                        if (this.satellite.orbit) {
                            this.satellite.orbit.period = Number(this.satellite.orbit.period?.toFixed(3));
                            this.satellite.orbit.semiMajorAxis = Math.round(this.satellite.orbit.semiMajorAxis);
                        }
                        this.satellitePartNames =
                            this.satellite.satelliteParts?.map(
                                (satellitePart) => satellitePart.satellitePart.partName
                            ) || [];
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

    openPurposeDialog() {
        const dialogRef = this.dialog.open(AddPurposeDialogComponent);
        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.purposes.push(result);
            }
        });
    }

    drop(event: CdkDragDrop<ICustomSatellitePart[]>) {
        console.log(event);
        this.dragDisabled = true;

        const previousIndex = this.satellite.satelliteParts?.findIndex((part) => part == event.item.data);
        if (previousIndex == undefined) return;
        moveItemInArray(
            this.satellite.satelliteParts ? this.satellite.satelliteParts : [],
            previousIndex,
            event.currentIndex
        );
        this.table?.renderRows();
    }

    removePart(part: ICustomSatellitePart) {
        this.satellite.satelliteParts?.filter(
            (satellitePart) => satellitePart.satellitePart.partName != part.satellitePart.partName
        );
        this.satellitePartNames =
            this.satellite.satelliteParts?.map((satellitePart) => satellitePart.satellitePart.partName) || [];
    }

    getContrastYIQ(hexcolor: string) {
        var r = parseInt(hexcolor.substring(1, 3), 16);
        var g = parseInt(hexcolor.substring(3, 5), 16);
        var b = parseInt(hexcolor.substring(5, 7), 16);
        var yiq = (r * 299 + g * 587 + b * 114) / 1000;
        return yiq >= 128 ? 'black' : 'white';
    }

    onSubmit() {
        if (this.componentExists) {
            this.satellite.orbit = undefined;
            const dialogRef = this.dialog.open(AddEditDialogComponent, {
                data: { message: 'Are you sure you want to update this satellite?' },
            });
            dialogRef.afterClosed().subscribe((ok) => {
                if (ok == 'ok') {
                    this.satelliteService.update(this.satellite!).subscribe((satellite) => {
                        if (satellite) {
                            this.snackBar.success('Satellite updated successfully');
                            this.router.navigate(['/users/' + this.username + '/satellites/' + satellite?._id]);
                        } else {
                            this.snackBar.error('Satellite could not be updated');
                        }
                    });
                }
            });
        } else {
            const dialogRef = this.dialog.open(AddEditDialogComponent, {
                data: { message: 'Are you sure you want to create this satellite?' },
            });
            dialogRef.afterClosed().subscribe((ok) => {
                if (ok == 'ok') {
                    this.satelliteService.create(this.satellite!).subscribe((satellite) => {
                        if (satellite) {
                            this.snackBar.success('Satellite created successfully');
                            this.router.navigate(['/users/' + this.username + '/satellites/' + satellite?._id]);
                        } else {
                            this.snackBar.error('Satellite could not be created');
                        }
                    });
                }
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
