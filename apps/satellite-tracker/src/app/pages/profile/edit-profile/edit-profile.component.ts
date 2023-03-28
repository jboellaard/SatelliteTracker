import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { IUser, UserIdentity } from 'shared/domain';
import { AuthService } from '../../../auth/auth.service';
import { AddEditDialogComponent } from '../../../utils/add-edit-dialog/add-edit-dialog.component';
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
                    }
                });
            }
        });
    }

    getLocation(): void {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                if (this.user) {
                    if (!this.user.location) this.user.location = { coordinates: { latitude: 0, longitude: 0 } };
                    this.user.location.coordinates!.latitude = position.coords.latitude;
                    this.user.location.coordinates!.longitude = position.coords.longitude;
                }
            });
        } else {
            this.snackBar.info('Geolocation is not supported by this browser.');
        }
    }

    onSubmit(): void {
        if (this.user) {
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
