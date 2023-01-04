import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Id, ISatellite } from 'shared/domain';
import { UserService } from '../../user/user.service';
import { SatelliteService } from '../satellite.service';

@Component({
    selector: 'app-satellite-detail',
    templateUrl: './satellite-detail.component.html',
    styleUrls: ['./satellite-detail.component.scss'],
})
export class SatelliteDetailComponent implements OnInit {
    username: string | null | undefined;
    id: Id | null | undefined;
    satellite: ISatellite | undefined;
    userSub: Subscription | undefined;
    satelliteSub: Subscription | undefined;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        public userService: UserService,
        public satelliteService: SatelliteService
    ) {}

    ngOnInit(): void {
        this.route.paramMap.subscribe((params) => {
            this.id = params.get('satelliteId');
            this.username = params.get('username')!;
            if (this.id) {
                this.satelliteSub = this.satelliteService.getById(this.id).subscribe((satellite) => {
                    if (satellite) this.satellite = satellite;
                    else this.router.navigate([`/users/${this.username}/satellites/new`]);
                });
            } else {
                this.router.navigate([`/users/${this.username}/satellites/new`]);
            }
        });
    }

    removeSatellite(id: Id) {
        this.satelliteService.delete(id);
        this.router.navigate([`/users/${this.username}`]);
    }
}
