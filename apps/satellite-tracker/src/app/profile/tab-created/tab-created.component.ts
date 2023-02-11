import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ISatellite, IUser } from 'shared/domain';
import { SatelliteService } from '../../pages/satellite/satellite.service';

@Component({
    selector: 'app-tab-created',
    templateUrl: './tab-created.component.html',
    styleUrls: ['./tab-created.component.scss'],
})
export class TabCreatedComponent implements OnInit {
    satelliteColumns = ['name', 'mass', 'radius', 'orbit', 'createdAt', 'updatedAt'];
    satellites: ISatellite[] = [];
    admin = false;
    canEdit = false;
    user: IUser | undefined;

    satelliteSub!: Subscription;

    constructor(private satelliteService: SatelliteService, private breakpointObserver: BreakpointObserver) {}

    ngOnInit(): void {
        this.getSatellites();

        this.satelliteService.getRefreshRequired().subscribe(() => {
            this.getSatellites();
        });
        this.breakpointObserver.observe(['(max-width: 600px)']).subscribe((result) => {
            if (result.matches) {
                this.satelliteColumns = ['name', 'orbit'];
            } else {
                this.breakpointObserver.observe(['(max-width: 1060px)']).subscribe((result) => {
                    if (result.matches) {
                        this.satelliteColumns = ['name', 'orbit', 'updatedAt'];
                    } else {
                        this.satelliteColumns = ['name', 'radius', 'orbit', 'updatedAt'];
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
}
