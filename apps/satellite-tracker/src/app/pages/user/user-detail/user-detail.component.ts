import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { BehaviorSubject, Observable, Subscription, switchMap, tap } from 'rxjs';
import { Id, ISatellite, IUser } from 'shared/domain';
import { SatelliteService } from '../../satellite/satellite.service';
import { UserService } from '../user.service';

@Component({
    selector: 'app-user-detail',
    templateUrl: './user-detail.component.html',
    styleUrls: ['./user-detail.component.scss', '../user.component.scss'],
})
export class UserDetailComponent implements OnInit {
    user$!: Observable<IUser | undefined>;
    username: string | null | undefined;
    id: Id | null | undefined;
    user?: IUser;
    satelliteColumns: string[] = ['name', 'mass', 'radius', 'orbit', 'createdAt', 'updatedAt', 'buttons'];
    satellites: ISatellite[] = [];
    admin = false;

    userSub!: Subscription;
    satelliteSub!: Subscription;

    // user$ = this.userService.exampleData$;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        public userService: UserService,
        public satelliteService: SatelliteService,
        private breakpointObserver: BreakpointObserver
    ) {}

    ngOnInit(): void {
        console.log('UserDetailComponent.ngOnInit()');
        this.route.paramMap.subscribe((params) => {
            this.username = params.get('username');
            if (this.username) {
                this.userSub = this.userService.getById(this.username).subscribe((user) => {
                    console.log(user);
                    if (user) {
                        this.user = user;
                        this.username = this.user.username;
                        this.satelliteSub = this.satelliteService
                            .getSatellitesOfUserWithUsername(this.username)
                            .subscribe((satellites) => {
                                console.log(satellites);
                                if (satellites) this.satellites = satellites;
                            });
                    } else this.router.navigate(['/users/new']);
                });
            } else {
                this.router.navigate(['/users/new']);
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

    removeUser(id: Id) {
        this.userService.delete(id);
        this.router.navigate(['/users']);
    }

    removeSatellite(id: Id) {
        this.satelliteService.delete(id);
        if (this.user?.username) {
            this.satelliteSub = this.satelliteService
                .getSatellitesOfUserWithUsername(this.user.username)
                .subscribe((satellites) => {
                    if (satellites) this.satellites = satellites;
                });
        }
    }

    ngOnDestroy(): void {
        this.userSub.unsubscribe();
        this.satelliteSub.unsubscribe();
    }
}
