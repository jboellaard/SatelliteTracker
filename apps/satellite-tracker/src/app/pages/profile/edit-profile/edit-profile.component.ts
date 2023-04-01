import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { IUser, IUserInfo, UserIdentity } from 'shared/domain';
import { AuthService } from '../../../auth/auth.service';
import { AddEditDialogComponent } from '../../../utils/add-edit-dialog/add-edit-dialog.component';
import { DeleteDialogComponent } from '../../../utils/delete-dialog/delete-dialog.component';
import { SnackBarService } from '../../../utils/snack-bar.service';
import { ProfileService } from '../profile.service';

@Component({
    selector: 'app-edit-profile',
    templateUrl: './edit-profile.component.html',
    styleUrls: ['../profile.component.scss'],
})
export class EditProfileComponent implements OnInit, OnDestroy {
    loggedInUser: UserIdentity | undefined;
    userSub: Subscription | undefined;

    user: IUser | undefined;
    coordinates: { latitude: number | undefined; longitude: number | undefined } = {
        latitude: undefined,
        longitude: undefined,
    };
    profileInfoSub: Subscription | undefined;

    constructor(
        private authService: AuthService,
        private profileService: ProfileService,
        private snackBar: SnackBarService,
        private dialog: MatDialog,
        private router: Router,
        private route: ActivatedRoute
    ) {}

    ngOnInit(): void {
        this.userSub = this.authService.user$.subscribe((loggedInUser) => {
            if (loggedInUser) {
                this.loggedInUser = loggedInUser;
                this.profileInfoSub = this.profileService.getSelf().subscribe((user) => {
                    if (user) {
                        this.user = user;
                        if (this.user.location?.coordinates) {
                            this.coordinates = this.user.location.coordinates;
                        }
                    }
                });
            }
        });
    }

    getLocation(): void {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                if (this.user) {
                    this.coordinates.latitude = position.coords.latitude;
                    this.coordinates.longitude = position.coords.longitude;
                }
            });
        } else {
            this.snackBar.info('Geolocation is not supported by this browser.');
        }
    }

    removeLocation(): void {
        this.coordinates.latitude = undefined;
        this.coordinates.longitude = undefined;
    }

    deleteSelf(): void {
        const dialogRef = this.dialog.open(DeleteDialogComponent, {
            data: { message: 'Are you sure you want to delete your account? This action is irreversible!' },
        });
        dialogRef.afterClosed().subscribe((ok) => {
            if (ok == 'ok') {
                this.profileService.deleteSelf().subscribe((satellite) => {
                    if (satellite) {
                        this.snackBar.success('Account deleted successfully');
                        this.authService.logout();
                    } else {
                        this.snackBar.error('Account could not be deleted');
                    }
                });
            }
        });
    }

    onSubmit(): void {
        if (this.user) {
            if (this.coordinates.latitude && this.coordinates.longitude) {
                if (!this.user.location) this.user.location = { coordinates: { latitude: 0, longitude: 0 } };
                this.user.location.coordinates = {
                    latitude: this.coordinates.latitude,
                    longitude: this.coordinates.longitude,
                };
            } else if (this.coordinates.latitude || this.coordinates.longitude) {
                this.snackBar.error('Please enter both latitude and longitude');
                return;
            } else if (this.user.location && !this.coordinates.latitude && !this.coordinates.longitude) {
                this.user.location = undefined;
            }
            console.log(this.user);
            const dialogRef = this.dialog.open(AddEditDialogComponent, {
                data: { message: 'Are you sure you want to update your information?' },
            });
            dialogRef.afterClosed().subscribe((ok) => {
                if (ok == 'ok') {
                    this.profileService.updateSelf(this.user!).subscribe((satellite) => {
                        if (satellite) {
                            this.snackBar.success('Profile updated successfully');
                            this.router.navigate(['..'], { relativeTo: this.route });
                        } else {
                            this.snackBar.error('Profile could not be updated');
                        }
                    });
                }
            });
        }
    }

    ngOnDestroy(): void {
        if (this.userSub) this.userSub.unsubscribe();
    }
}
