import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackBarServiceGeneric } from 'ui/utils';

@Injectable({
    providedIn: 'root',
})
export class SnackBarService extends SnackBarServiceGeneric {
    constructor(snackBar: MatSnackBar) {
        super(snackBar);
    }
}
