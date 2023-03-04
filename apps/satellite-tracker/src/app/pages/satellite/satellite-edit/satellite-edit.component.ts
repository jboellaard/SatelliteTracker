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
import { AddPartDialogComponent } from './add-part-dialog/add-part-dialog.component';

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
        satelliteParts: [],
    };
    username: string | undefined;

    satellitePartError: string | undefined = undefined;

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
            satelliteParts.sort((a, b) => a.partName.localeCompare(b.partName));
            this.allSatelliteParts = satelliteParts;
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
        const dialogRef = this.dialog.open(AddPurposeDialogComponent, {
            position: { left: '50%' },
        });
        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.purposes.push(result);
            }
        });
    }

    drop(event: CdkDragDrop<ICustomSatellitePart[]>) {
        console.log(event.item.data);
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
        const index = this.satellite.satelliteParts?.findIndex((satellitePart) => satellitePart == part);
        console.log(index);
        if (index != undefined) {
            console.log(index);
            this.satellite.satelliteParts?.splice(index, 1);
        }
        this.table?.renderRows();
    }

    getContrastYIQ(hexcolor: string) {
        let r = parseInt(hexcolor.substring(1, 3), 16);
        let g = parseInt(hexcolor.substring(3, 5), 16);
        let b = parseInt(hexcolor.substring(5, 7), 16);
        let yiq = (r * 299 + g * 587 + b * 114) / 1000;
        return yiq >= 128 ? 'black' : 'white';
    }

    openAddPartDialog() {
        const dialogRef = this.dialog.open(AddPartDialogComponent, {
            data: { allSatelliteParts: this.allSatelliteParts },
        });
        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.satellitePartError = undefined;
                if (!this.satellite.satelliteParts) this.satellite.satelliteParts = [];
                this.satellite.satelliteParts = [...this.satellite.satelliteParts, result];
            }
        });
    }

    checkDependencies() {
        if (this.satellite.satelliteParts) {
            for (const customPart of this.satellite.satelliteParts) {
                if (customPart.satellitePart.dependsOn) {
                    let noDependencies = true;
                    const part = customPart.satellitePart;
                    for (const element of part.dependsOn!) {
                        if (
                            this.satellite.satelliteParts.find(
                                (customPart) => customPart.satellitePart.partName == element.partName
                            )
                        ) {
                            noDependencies = false;
                        }
                    }
                    if (noDependencies && part.dependsOn!.length > 0) {
                        let dependencies = '';
                        for (let i = 0; i < part.dependsOn!.length; i++) {
                            if (i == part.dependsOn!.length - 1) {
                                dependencies += part.dependsOn![i].partName;
                            } else {
                                dependencies += part.dependsOn![i].partName + ', ';
                            }
                        }
                        this.satellitePartError =
                            'The part ' +
                            part.partName +
                            ' cannot function if the satellite does not have any of the following parts: ' +
                            dependencies +
                            ', please add at least one.';
                        return false;
                    }
                }
            }
        }
        return true;
    }

    private create() {
        const dialogref = this.dialog.open(AddEditDialogComponent, {
            data: { message: 'Are you sure you want to create this satellite?' },
            position: { left: 'calc(50% - 70px)' },
        });
        dialogref.afterClosed().subscribe((ok) => {
            if (ok == 'ok') {
                this.satelliteService.create(this.satellite).subscribe((satellite) => {
                    if (satellite) {
                        this.snackBar.success('Satellite created successfully');
                        this.router.navigate(['/users/' + this.username + '/satellites/' + satellite._id]);
                    } else {
                        this.snackBar.error('Satellite could not be created');
                    }
                });
            }
        });
    }

    private update() {
        this.satellite.orbit = undefined;
        const dialogRef = this.dialog.open(AddEditDialogComponent, {
            data: { message: 'Are you sure you want to update this satellite?' },
            position: { left: 'calc(50% - 70px)' },
        });
        dialogRef.afterClosed().subscribe((ok) => {
            if (ok == 'ok') {
                this.satelliteService.update(this.satellite).subscribe((satellite) => {
                    if (satellite) {
                        this.snackBar.success('Satellite updated successfully');
                        this.router.navigate(['/users/' + this.username + '/satellites/' + satellite._id]);
                    } else {
                        this.snackBar.error('Satellite could not be updated');
                    }
                });
            }
        });
    }

    onSubmit() {
        if (!this.checkDependencies()) return;
        if (this.componentExists) {
            this.update();
        } else {
            this.create();
        }
    }

    backClicked() {
        if (this.componentExists) {
            this.router.navigate(['/users/' + this.username + '/satellites/' + this.id]);
        } else {
            this.router.navigate(['/profile/' + this.username]);
        }
    }

    ngOnDestroy() {
        if (this.paramSub) this.paramSub.unsubscribe();
        if (this.userSub) this.userSub.unsubscribe();
        if (this.satelliteSub) this.satelliteSub.unsubscribe();
        if (this.satellitePartSub) this.satellitePartSub.unsubscribe();
    }
}
