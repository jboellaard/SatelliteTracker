import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ICustomSatellitePart, Id, ISatellite, ISatellitePart, Purpose, Shape } from 'shared/domain';
import { SatelliteService } from '../satellite.service';
import { AddPurposeDialogComponent } from './add-purpose-dialog/add-purpose-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { SnackBarService } from '../../../utils/snack-bar.service';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { AddEditDialogComponent } from '../../../utils/add-edit-dialog/add-edit-dialog.component';
import { MatTable } from '@angular/material/table';
import { AddPartDialogComponent } from './add-part-dialog/add-part-dialog.component';
import { RelationsService } from '../../../auth/relations.service';

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
        private relationsService: RelationsService,
        private dialog: MatDialog,
        private snackBar: SnackBarService
    ) {}

    ngOnInit(): void {
        this.satellitePartSub = this.satelliteService.getSatelliteParts().subscribe((satelliteParts) => {
            satelliteParts.sort((a, b) => a.partName.localeCompare(b.partName));
            this.allSatelliteParts = satelliteParts;
        });
        this.paramSub = this.route.paramMap.subscribe((params) => {
            this.id = params.get('satelliteId');
            this.username = params.get('username')!;
            if (this.id) {
                this.componentExists = true;
                this.satelliteSub = this.satelliteService.getById(this.id).subscribe((satellite) => {
                    if (satellite) {
                        this.satellite = { ...satellite };
                        if (!this.satellite.satelliteParts) this.satellite.satelliteParts = [];
                        if (this.satellite.purpose && this.purposes.indexOf(this.satellite.purpose) == -1) {
                            this.purposes.push(this.satellite.purpose);
                        }
                    }
                });
            }
        });
    }

    openPurposeDialog() {
        let position = {};
        if (window.innerWidth > 780) {
            position = { left: '50%' };
        }
        const dialogRef = this.dialog.open(AddPurposeDialogComponent, {
            position,
        });
        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.purposes.push(result);
            }
        });
    }

    drop(event: CdkDragDrop<ICustomSatellitePart[]>) {
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
        if (index != undefined) {
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

    constructDependencyError(customPart: ICustomSatellitePart) {
        let dependencies = '';
        for (let i = 0; i < customPart.satellitePart.dependsOn!.length; i++) {
            if (i == customPart.satellitePart.dependsOn!.length - 1) {
                dependencies += customPart.satellitePart.dependsOn![i].partName;
            } else {
                dependencies += customPart.satellitePart.dependsOn![i].partName + ', ';
            }
        }
        this.satellitePartError =
            'The part ' +
            customPart.satellitePart.partName +
            ' cannot function if the satellite does not have any of the following parts: ' +
            dependencies +
            ', please add at least one.';
    }

    checkDependencies(parts: ICustomSatellitePart[]): boolean {
        for (const customPart of parts) {
            if (customPart.satellitePart.dependsOn) {
                let noDependencies = true;
                for (const part of customPart.satellitePart.dependsOn) {
                    if (parts.find((cp) => cp.satellitePart.partName == part.partName)) {
                        noDependencies = false;
                    }
                }
                if (noDependencies && customPart.satellitePart.dependsOn.length > 0) {
                    this.constructDependencyError(customPart);
                    return false;
                }
            }
        }
        return true;
    }

    private create() {
        let position = {};
        if (window.innerWidth > 780) {
            position = { left: 'calc(50% - 70px)' };
        }
        const dialogref = this.dialog.open(AddEditDialogComponent, {
            data: { message: 'Are you sure you want to create this satellite?' },
            position,
        });
        dialogref.afterClosed().subscribe((ok) => {
            if (ok == 'ok') {
                this.satelliteService.create(this.satellite).subscribe((satellite) => {
                    if (satellite) {
                        this.relationsService.getTracking().subscribe();
                        this.snackBar.success('Satellite created successfully');
                        this.router.navigate(['/users/' + this.username + '/satellites/' + satellite.id]);
                    } else {
                        this.snackBar.error('Satellite could not be created');
                    }
                });
            }
        });
    }

    private update() {
        let position = {};
        if (window.innerWidth > 780) {
            position = { left: 'calc(50% - 70px)' };
        }
        this.satellite.orbit = undefined;
        const dialogRef = this.dialog.open(AddEditDialogComponent, {
            data: { message: 'Are you sure you want to update this satellite?' },
            position,
        });
        dialogRef.afterClosed().subscribe((ok) => {
            if (ok == 'ok') {
                this.satelliteService.update(this.satellite).subscribe((satellite) => {
                    if (satellite) {
                        this.snackBar.success('Satellite updated successfully');
                        this.router.navigate(['/users/' + this.username + '/satellites/' + satellite.id]);
                    } else {
                        this.snackBar.error('Satellite could not be updated');
                    }
                });
            }
        });
    }

    onSubmit() {
        if (this.satellite.satelliteParts && !this.checkDependencies(this.satellite.satelliteParts)) return;
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
