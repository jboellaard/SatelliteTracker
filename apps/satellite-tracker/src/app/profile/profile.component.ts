import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, Subscription } from 'rxjs';
import { IUser, Id, ISatellite, UserIdentity } from 'shared/domain';
import { AuthService } from '../auth/auth.service';
import { UserService } from '../pages/user/user.service';
import { SnackBarService } from '../utils/snack-bar.service';
import { ProfileService } from './profile.service';
import { RelationsService } from './relations.service';

@Component({
    selector: 'app-profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit, OnDestroy {
    tabs: { label: string; route: string }[] = [
        { label: 'Created', route: 'created' },
        { label: 'Tracking', route: 'tracking' },
        { label: 'Following', route: 'following' },
        { label: 'Followers', route: 'followers' },
    ];

    loggedInUser: UserIdentity | undefined;
    loggedInUserFollowing: IUser[] | undefined;

    user?: IUser;
    username: string | null | undefined;
    id: Id | null | undefined;

    admin = false;
    canEdit = false;

    waiting = false;

    userSub: Subscription | undefined;
    followingSub: Subscription | undefined;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private authService: AuthService,
        private relationsService: RelationsService,
        private profileService: ProfileService,
        private userService: UserService,
        private snackBar: SnackBarService
    ) {}

    ngOnInit(): void {
        this.userSub = this.authService.user$.subscribe((user) => {
            if (user) {
                this.loggedInUser = user;
            }
        });
        this.followingSub = this.relationsService.following$.subscribe((following) => {
            this.loggedInUserFollowing = following;
        });
        this.route.paramMap.subscribe((params) => {
            this.user = undefined;
            this.username = params.get('username');

            if (this.username) {
                if (this.username === this.loggedInUser?.username) {
                    this.userSub = this.profileService.getSelf().subscribe((user) => {
                        if (user) {
                            this.user = user;
                            this.canEdit = true;
                            this.profileService.canEdit$.next(true);
                            this.profileService.currentUser$.next(user);
                        } else {
                            this.snackBar.error('Could not find this user');
                            this.router.navigate(['/home']);
                        }
                    });
                } else {
                    this.userSub = this.userService.getByUsername(this.username).subscribe((user) => {
                        if (user) {
                            this.user = user;
                            this.canEdit = false;
                            this.profileService.canEdit$.next(false);
                            this.profileService.currentUser$.next(user);
                        } else {
                            this.snackBar.error('Could not find this user');
                            this.router.navigate(['/home']);
                        }
                    });
                }
            } else {
                this.router.navigate(['home']);
            }
        });
    }

    isFollowing() {
        if (this.loggedInUserFollowing && this.user) {
            return this.loggedInUserFollowing.some((user) => user.username === this.user?.username);
        }
        return false;
    }

    followUser() {
        if (this.user) {
            this.waiting = true;
            this.profileService.followUser(this.user.username).subscribe((user) => {
                this.waiting = false;
                if (user) {
                    this.snackBar.success('You are now following this user');
                } else {
                    this.snackBar.error('Could not follow this user');
                }
            });
        }
    }

    unfollowUser() {
        if (this.user) {
            this.waiting = true;
            this.profileService.unfollowUser(this.user.username).subscribe((user) => {
                this.waiting = false;
                if (user) {
                    this.snackBar.success('You are no longer following this user');
                } else {
                    this.snackBar.error('Could not unfollow this user');
                }
            });
        }
    }

    ngOnDestroy(): void {
        if (this.userSub) this.userSub.unsubscribe();
        if (this.followingSub) this.followingSub.unsubscribe();
    }
}
