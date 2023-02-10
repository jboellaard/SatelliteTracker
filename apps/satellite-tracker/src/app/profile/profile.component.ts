import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { IUser, Id, ISatellite, UserIdentity } from 'shared/domain';
import { AuthService } from '../auth/auth.service';
import { SatelliteService } from '../pages/satellite/satellite.service';
import { UserService } from '../pages/user/user.service';
import { SnackBarService } from '../utils/snack-bar.service';

@Component({
    selector: 'app-profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit, OnDestroy {
    user$: UserIdentity | undefined;
    user?: IUser;
    username: string | null | undefined;
    id: Id | null | undefined;

    satelliteColumns = ['name', 'mass', 'radius', 'orbit', 'createdAt', 'updatedAt'];
    satellites: ISatellite[] = [];
    admin = false;
    canEdit = false;

    userSub!: Subscription;
    satelliteSub!: Subscription;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private authService: AuthService,
        private userService: UserService,
        private satelliteService: SatelliteService,
        private breakpointObserver: BreakpointObserver,
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
                this.userSub = this.userService.getByUsername(this.username).subscribe((user) => {
                    if (user) {
                        this.user = user;
                        console.log(this.user);
                        this.getSatellites();

                        this.satelliteService.getRefreshRequired().subscribe(() => {
                            this.getSatellites();
                        });
                    } else {
                        this.snackBar.error('Could not find this user');
                        this.router.navigate(['/home']);
                    }
                });
            } else {
                this.router.navigate(['home']);
            }
        });

        this.breakpointObserver.observe(['(max-width: 600px)']).subscribe((result) => {
            if (result.matches) {
                this.satelliteColumns = ['name', 'orbit'];
            } else {
                this.breakpointObserver.observe(['(max-width: 1000px)']).subscribe((result) => {
                    if (result.matches) {
                        this.satelliteColumns = ['name', 'mass', 'radius', 'orbit'];
                    } else {
                        this.satelliteColumns = ['name', 'mass', 'radius', 'orbit', 'createdAt', 'updatedAt'];
                    }
                });
            }
        });
    }

    private getSatellites() {
        if (this.user?.username) {
            this.satelliteSub = this.satelliteService
                .getSatellitesOfUserWithUsername(this.user.username)
                .subscribe((satellites) => {
                    console.log(satellites);
                    if (satellites) this.satellites = satellites;
                });
        }
    }

    followUser() {
        if (this.user$ && this.user) {
            this.userService.followUser(this.user.username).subscribe((user) => {
                if (user) {
                    // this.user = user;
                    this.snackBar.success('You are now following this user');
                } else {
                    this.snackBar.error('Could not follow this user');
                }
            });
        }
    }

    ngOnDestroy(): void {
        this.userSub.unsubscribe();
        this.satelliteSub.unsubscribe();
    }
}
