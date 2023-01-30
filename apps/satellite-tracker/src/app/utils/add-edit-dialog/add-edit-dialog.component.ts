import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
    selector: 'app-add-edit-dialog',
    template: `
        <h1 mat-dialog-title>Submit form</h1>
        <div mat-dialog-content>
            <p>{{ data.message }}</p>
        </div>
        <div mat-dialog-actions>
            <button mat-flat-button (click)="onNoClick()">Cancel</button>
            <button mat-flat-button color="primary" [mat-dialog-close]="'ok'" cdkFocusInitial>Submit</button>
        </div>
    `,
})
export class AddEditDialogComponent {
    constructor(
        public dialogRef: MatDialogRef<AddEditDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { message: string }
    ) {}

    onNoClick(): void {
        this.dialogRef.close();
    }
}
