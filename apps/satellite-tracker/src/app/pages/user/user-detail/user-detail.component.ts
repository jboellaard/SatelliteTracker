import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { BehaviorSubject, Observable, Subscription, switchMap, tap } from 'rxjs';
import { ISatellite, IUser } from 'shared/domain';
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
    id: string | null | undefined;
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
        this.route.paramMap.subscribe((params) => {
            this.id = params.get('id');
            if (this.id) {
                this.user = this.userService.getById(this.id);
                if (!this.user) {
                    this.router.navigate(['/users/new']);
                }
                this.satellites = this.satelliteService.getSatellitesOfUserWithId(parseInt(this.id));
            } else {
                this.router.navigate(['/users/new']);
            }
        });
    }

    removeUser(id: number) {
        this.userService.delete(id);
        this.router.navigate(['/users']);
    }

    removeSatellite(id: number) {
        this.satelliteService.delete(id);
        this.satellites = this.satelliteService.getSatellitesOfUserWithId(this.user!.id!);
    }

    // ngOnInit(): void {
    //   this.userSub = this.userService.read(this.route.snapshot.paramMap.get('id')!).subscribe((user) => {
    //     if (user) this.user = user;
    //   });
    //   this.satelliteSub = this.satelliteService
    //     .getSatellitesOfUserWithId(this.route.snapshot.paramMap.get('id')!)
    //     .subscribe((satellites) => {
    //       if (satellites) this.satellites = satellites;
    //     });
    // }

    // ngOnDestroy(): void {
    //   this.userSub.unsubscribe();
    //   this.satelliteSub.unsubscribe();
    // }

    // removeUser(id: number) {
    //   this.userService.delete(id).subscribe(() => this.router.navigate(['/users']));
    // }

    // removeSatellite(id: number) {
    //   this.satelliteService.delete(id).subscribe();
    //   this.satelliteSub = this.satelliteService.getSatellitesOfUserWithId(`${this.user!.id}`).subscribe((satellites) => {
    //     if (satellites) this.satellites = satellites;
    //   });
    // }
}
