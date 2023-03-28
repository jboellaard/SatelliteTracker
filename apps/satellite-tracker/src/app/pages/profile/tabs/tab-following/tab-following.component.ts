import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { IUser, IUserInfo, UserIdentity } from 'shared/domain';
import { AuthService } from '../../../../auth/auth.service';
import { ProfileService } from '../../profile.service';
import { RelationsService } from '../../../../auth/relations.service';

@Component({
    selector: 'app-tab-following',
    templateUrl: './tab-following.component.html',
    styleUrls: ['../tab.component.scss'],
})
export class TabFollowingComponent {
    users: IUserInfo[] | undefined;
    canEdit = false;
    user: IUser | undefined;
    loggedInUser: UserIdentity | undefined;
    following: IUserInfo[] | undefined;

    waiting = false;

    loggedInUserSub: Subscription | undefined;
    followingSub: Subscription | undefined;
    userSub: Subscription | undefined;
    editSub: Subscription | undefined;
    userFollowingSub: Subscription | undefined;

    constructor(
        private profileService: ProfileService,
        private relationsService: RelationsService,
        private authService: AuthService
    ) {}

    ngOnInit(): void {
        this.loggedInUserSub = this.authService.user$.subscribe((user) => {
            this.loggedInUser = user;
        });

        this.followingSub = this.relationsService.following$.subscribe((following) => {
            this.following = following;
        });

        this.userSub = this.profileService.currentUser$.subscribe((user) => {
            this.user = user;
            if (user && this.profileService.following$.value == undefined)
                this.profileService.getFollowing(user.username).subscribe();
        });

        this.userFollowingSub = this.profileService.following$.subscribe((following) => {
            if (following) this.users = following;
        });

        this.editSub = this.profileService.canEdit$.subscribe((canEdit) => {
            this.canEdit = canEdit;
        });
    }

    isFollowing(username: string | undefined) {
        return this.following?.some((user) => user.username == username);
    }

    follow(username: string) {
        this.waiting = true;
        this.relationsService.followUser(username).subscribe(() => {
            this.waiting = false;
        });
    }

    unfollow(username: string) {
        this.waiting = true;
        this.relationsService.unfollowUser(username).subscribe(() => {
            this.waiting = false;
        });
    }

    ngOnDestroy(): void {
        if (this.loggedInUserSub) this.loggedInUserSub.unsubscribe();
        if (this.followingSub) this.followingSub.unsubscribe();
        if (this.userSub) this.userSub.unsubscribe();
        if (this.editSub) this.editSub.unsubscribe();
        if (this.userFollowingSub) this.userFollowingSub.unsubscribe();
    }
}
