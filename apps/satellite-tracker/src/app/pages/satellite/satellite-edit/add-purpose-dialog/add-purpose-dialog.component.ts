import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
    selector: 'app-add-purpose-dialog',
    template: `
        <h1 mat-dialog-title>Add Purpose</h1>
        <div mat-dialog-content>
            <mat-form-field>
                <mat-label>Purpose</mat-label>
                <input matInput [(ngModel)]="purpose" required />
            </mat-form-field>
        </div>
        <div mat-dialog-actions style="justify-content: space-between; margin: 10px;">
            <button mat-flat-button (click)="onNoClick()">Cancel</button>
            <button mat-flat-button color="primary" [mat-dialog-close]="purpose" [disabled]="!purpose || purpose == ''">
                Add
            </button>
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
