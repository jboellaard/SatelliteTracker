import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { Id, ISatellite, IUser, UserIdentity } from 'shared/domain';
import { AuthService } from '../../../auth/auth.service';
import { SnackBarService } from '../../../utils/snack-bar.service';
import { SatelliteService } from '../../satellite/satellite.service';
import { UserService } from '../user.service';

@Component({
    selector: 'app-user-detail',
    templateUrl: './user-detail.component.html',
    styleUrls: ['./user-detail.component.scss', '../user.component.scss'],
})
export class UserDetailComponent implements OnInit {
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
        private userService: UserService,
        private satelliteService: SatelliteService,
        private breakpointObserver: BreakpointObserver,
        private snackBar: SnackBarService
    ) {}

    ngOnInit(): void {
        this.route.paramMap.subscribe((params) => {
            this.username = params.get('username');
            if (this.username) {
                this.userSub = this.userService.getByUsername(this.username).subscribe((user) => {
                    if (user) {
                        this.user = user;
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

    ngOnDestroy(): void {
        this.userSub.unsubscribe();
        this.satelliteSub.unsubscribe();
    }
}
