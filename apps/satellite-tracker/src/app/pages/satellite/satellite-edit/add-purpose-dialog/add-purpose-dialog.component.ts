import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
    selector: 'app-add-purpose-dialog',
    template: `
        <h1 mat-dialog-title>Add Purpose</h1>
        <div mat-dialog-content>
            <mat-form-field>
                <mat-label>Purpose</mat-label>
                <input matInput [(ngModel)]="purpose" />
            </mat-form-field>
        </div>
        <div mat-dialog-actions>
            <button mat-button (click)="onNoClick()">Cancel</button>
            <button mat-button [mat-dialog-close]="purpose" cdkFocusInitial>Add</button>
        </div>
    `,
})
export class AddPurposeDialogComponent {
    constructor(
        public dialogRef: MatDialogRef<AddPurposeDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public purpose: string
    ) {}

    onNoClick(): void {
        this.dialogRef.close();
    }
}
