import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
    selector: 'app-delete-dialog',
    template: `
        <h1 mat-dialog-title>Delete item</h1>
        <div mat-dialog-content>
            <p>{{ data.message }}</p>
        </div>
        <div mat-dialog-actions>
            <button mat-flat-button (click)="onNoClick()">Cancel</button>
            <button mat-flat-button color="warn" [mat-dialog-close]="'ok'" cdkFocusInitial>Delete</button>
        </div>
    `,
})
export class DeleteDialogComponent {
    constructor(
        public dialogRef: MatDialogRef<DeleteDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { message: string }
    ) {}

    onNoClick(): void {
        this.dialogRef.close();
    }
}