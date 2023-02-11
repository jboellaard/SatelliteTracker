import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { IUser, Id, ISatellite, UserIdentity } from 'shared/domain';
import { AuthService } from '../auth/auth.service';
import { SatelliteService } from '../pages/satellite/satellite.service';
import { UserService } from '../pages/user/user.service';
import { SnackBarService } from '../utils/snack-bar.service';
import { ProfileService } from './profile.service';

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

    user$: UserIdentity | undefined;
    user?: IUser;
    username: string | null | undefined;
    id: Id | null | undefined;

    admin = false;
    canEdit = false;

    userSub!: Subscription;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private authService: AuthService,
        private profileService: ProfileService,
        private userService: UserService,
        private snackBar: SnackBarService
    ) {}

    ngOnInit(): void {
        this.userSub = this.authService.user$.subscribe((user) => {
            if (user) {
                this.user$ = user;
            }
        });
        this.route.paramMap.subscribe((params) => {
            this.username = params.get('username');
            if (this.username) {
                if (this.username === this.user$?.username) {
                    this.canEdit = true;
                    this.userSub = this.profileService.getSelf().subscribe((user) => {
                        if (user) {
                            this.user = user;
                            console.log(this.user);
                        }
                    });
                } else {
                    this.userSub = this.userService.getByUsername(this.username).subscribe((user) => {
                        if (user) {
                            this.user = user;
                            console.log(this.user);
                            // this.getSatellites();

                            // this.satelliteService.getRefreshRequired().subscribe(() => {
                            //     this.getSatellites();
                            // });
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

    followUser() {
        if (this.user$ && this.user) {
            this.profileService.followUser(this.user.username).subscribe((user) => {
                if (user) {
                    // this.user = user;
                    this.snackBar.success('You are now following this user');
                } else {
                    this.snackBar.error('Could not follow this user');
                }
            });
        }
    }

    onOutletLoaded(component: any) {
        component.user = this.user;
        component.canEdit = this.canEdit;
    }

    ngOnDestroy(): void {
        if (this.userSub) this.userSub.unsubscribe();
    }
}
