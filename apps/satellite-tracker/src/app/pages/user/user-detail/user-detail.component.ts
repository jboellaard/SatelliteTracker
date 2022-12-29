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
    satelliteColumns: string[] = ['id', 'name', 'mass', 'radius', 'orbit', 'createdAt', 'updatedAt', 'buttons'];
    satellites: ISatellite[] = [];

    userSub!: Subscription;
    satelliteSub!: Subscription;

    // user$ = this.userService.exampleData$;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        public userService: UserService,
        public satelliteService: SatelliteService
    ) {}

    ngOnInit(): void {
        console.log('UserDetailComponent.ngOnInit()');
        this.route.paramMap.subscribe((params) => {
            this.username = params.get('username');
            if (this.username) {
                this.userSub = this.userService.getById(this.username).subscribe((user) => {
                    if (user) this.user = user;
                    else this.router.navigate(['/users/new']);
                });
                if (this.user) {
                    this.username = this.user.username;
                    // this.satelliteSub = this.satelliteService
                    //     .getSatellitesOfUserWithId(this.username)
                    //     .subscribe((satellites) => {
                    //         if (satellites) this.satellites = satellites;
                    //     });
                }
            } else {
                this.router.navigate(['/users/new']);
            }
        });
    }

    removeUser(id: Id) {
        this.userService.delete(id);
        this.router.navigate(['/users']);
    }

    removeSatellite(id: Id) {
        this.satelliteService.delete(id);
        if (this.id) {
            this.satelliteSub = this.satelliteService.getSatellitesOfUserWithId(this.id).subscribe((satellites) => {
                if (satellites) this.satellites = satellites;
            });
        }
    }

    ngOnDestroy(): void {
        this.userSub.unsubscribe();
        this.satelliteSub.unsubscribe();
    }
}
