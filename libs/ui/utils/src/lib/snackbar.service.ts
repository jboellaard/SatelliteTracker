import { MatSnackBar } from '@angular/material/snack-bar';

export class SnackBarServiceGeneric {
    horizontalPosition: 'start' | 'center' | 'end' | 'left' | 'right' = 'center';
    verticalPosition: 'top' | 'bottom' = 'bottom';

    constructor(private snackBar: MatSnackBar) {}

    error(message: string) {
        this.snackBar.open(message, 'OK', {
            duration: 5000,
            panelClass: ['snackbar-error'],
            horizontalPosition: this.horizontalPosition,
            verticalPosition: this.verticalPosition,
        });
    }

    success(message: string) {
        this.snackBar.open(message, 'OK', {
            duration: 5000,
            panelClass: ['snackbar-success'],
            horizontalPosition: this.horizontalPosition,
            verticalPosition: this.verticalPosition,
        });
    }

    info(message: string) {
        this.snackBar.open(message, 'OK', {
            duration: 5000,
            panelClass: ['snackbar-info'],
            horizontalPosition: this.horizontalPosition,
            verticalPosition: this.verticalPosition,
        });
    }
}
