import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { IUser, UserIdentity } from 'shared/domain';
import { AuthService } from '../../auth/auth.service';
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

    constructor(private authService: AuthService, private profileService: ProfileService) {}

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

    onSubmit(): void {}

    ngOnDestroy(): void {
        if (this.userSub) this.userSub.unsubscribe();
    }
}
