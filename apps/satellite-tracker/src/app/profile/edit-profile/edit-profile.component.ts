import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { IUser, UserIdentity } from 'shared/domain';
import { AuthService } from '../../auth/auth.service';
import { SnackBarService } from '../../utils/snack-bar.service';
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
        private snackBar: SnackBarService
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
                    if (!this.user!.location) this.user!.location = { coordinates: { latitude: 0, longitude: 0 } };
                    this.user.location.coordinates!.latitude = position.coords.latitude;
                    this.user.location.coordinates!.longitude = position.coords.longitude;
                }
            });
        } else {
            this.snackBar.info('Geolocation is not supported by this browser.');
        }
    }

    onSubmit(): void {}

    ngOnDestroy(): void {
        if (this.userSub) this.userSub.unsubscribe();
    }
}
