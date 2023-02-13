import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SnackBarService } from 'apps/satellite-tracker/src/app/utils/snack-bar.service';
import { ICustomSatellitePart, ISatellitePart } from 'shared/domain';

@Component({
    selector: 'app-add-part-dialog',
    templateUrl: './add-part-dialog.component.html',
    styleUrls: ['./add-part-dialog.component.scss'],
})
export class AddPartDialogComponent {
    selectedPart!: ICustomSatellitePart;

    constructor(
        public dialogRef: MatDialogRef<AddPartDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { allSatelliteParts: ISatellitePart[] },
        private snackbar: SnackBarService
    ) {
        if (data.allSatelliteParts.length > 0) {
            this.selectedPart = {
                satellitePart: data.allSatelliteParts[0],
                color: '#000000',
                size: 0,
                quantity: 0,
            };
        } else {
            this.snackbar.error('Could not find any satellite parts.');
            this.dialogRef.close();
        }
    }

    onNoClick(): void {
        this.dialogRef.close();
    }
}
