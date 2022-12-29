import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Id, ISatellite } from 'shared/domain';
// import { SatelliteImplemented } from '../../satellite/satellite.model';
import { UserService } from '../../user/user.service';
import { SatelliteService } from '../satellite.service';

@Component({
    selector: 'app-satellite-edit',
    templateUrl: './satellite-edit.component.html',
    styleUrls: ['./satellite-edit.component.scss'],
})
export class SatelliteEditComponent implements OnInit, OnDestroy {
    componentId: string | null | undefined;
    componentExists = false;
    id!: Id | null | undefined;
    satellite: ISatellite | undefined;
    userId!: Id | null | undefined;
    username: string | undefined;
    userSub: Subscription | undefined;
    satelliteSub: Subscription | undefined;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private satelliteService: SatelliteService,
        private userService: UserService
    ) {}

    ngOnInit(): void {
        this.route.paramMap.subscribe((params) => {
            this.id = params.get('satelliteId')!;
            this.username = params.get('username')!;
            // this.userSub = this.userService.getByUsername(this.username).subscribe((user) => {
            //     if (user) {
            //         this.username = user.username;
            //     }
            // });
            if (this.id) {
                this.componentExists = true;
                this.satelliteSub = this.satelliteService.getById(this.id).subscribe((satellite) => {
                    if (satellite) {
                        this.satellite = { ...satellite };
                    } else {
                        this.newSatellite();
                    }
                });
            } else {
                this.newSatellite();
            }
        });
    }

    newSatellite() {
        this.componentExists = false;
        this.satellite = {
            satelliteName: '',
            purpose: '',
            mass: 0,
            sizeOfBase: 0,
            colorOfBase: '#000000',
            orbit: undefined,
            createdById: this.userId!, // userId from token!
        };
    }

    onSubmit() {
        console.log('Submitting the form');
        if (this.componentExists) {
            this.satelliteService.update(this.satellite!);
            this.router.navigate(['/users/' + this.username + '/satellites/' + this.id]);
        } else {
            this.satelliteService.create(this.satellite!).subscribe((satellite) => {
                this.satellite = { ...satellite };
                this.router.navigate(['/users/' + this.username + '/satellites/' + this.satellite.id]);
            });
        }
    }

    ngOnDestroy() {
        if (this.userSub) this.userSub.unsubscribe();
        if (this.satelliteSub) this.satelliteSub.unsubscribe();
    }
}
