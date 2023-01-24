import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Id, ISatellite } from 'shared/domain';
import { AuthService } from '../../../auth/auth.service';
import { UserService } from '../../user/user.service';
import { SatelliteService } from '../satellite.service';

@Component({
    selector: 'app-satellite-detail',
    templateUrl: './satellite-detail.component.html',
    styleUrls: ['./satellite-detail.component.scss'],
})
export class SatelliteDetailComponent implements OnInit {
    userId: Id | undefined;
    username: string | null | undefined;
    id: Id | null | undefined;
    satellite: ISatellite | undefined;
    userSub: Subscription | undefined;
    satelliteSub: Subscription | undefined;
    canEdit = false;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        public userService: UserService,
        public satelliteService: SatelliteService,
        private authService: AuthService
    ) {}

    ngOnInit(): void {
        this.userSub = this.authService.user$.subscribe((user) => {
            if (user) {
                this.userId = user.id;
            }
        });
        this.route.paramMap.subscribe((params) => {
            this.id = params.get('satelliteId');
            this.username = params.get('username')!;
            if (this.id) {
                this.satelliteSub = this.satelliteService.getById(this.id).subscribe((satellite) => {
                    if (satellite) {
                        this.satellite = satellite;
                        this.satellite.id = satellite._id;
                        console.log(this.userId, this.satellite.createdBy);
                        if (this.satellite.createdBy == this.userId) {
                            this.canEdit = true;
                        }
                    } else this.router.navigate([`/users/${this.username}/satellites/`]);
                });
            } else {
                this.router.navigate([`/users/${this.username}/satellites/`]);
            }
        });
    }

    removeSatellite(id: Id) {
        this.satelliteService.delete(id).subscribe(() => {});
        this.router.navigate([`/users/${this.username}`]);
    }
}
