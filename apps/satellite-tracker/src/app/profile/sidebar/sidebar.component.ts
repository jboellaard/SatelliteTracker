import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { UserIdentity, ISatellite } from 'shared/domain';
import { AuthService } from '../../auth/auth.service';
import { SatelliteService } from '../../pages/satellite/satellite.service';
import { ProfileService } from '../profile.service';

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit, OnDestroy {
    user: UserIdentity | undefined;
    satellites: ISatellite[] | undefined;
    userSub: Subscription | undefined;
    satellitesSub: Subscription | undefined;
    paramSub: Subscription | undefined;
    currentSatellite: string | undefined;

    constructor(
        private satelliteService: SatelliteService,
        private profileService: ProfileService,
        private authService: AuthService,
        private route: ActivatedRoute
    ) {}

    ngOnInit(): void {
        this.userSub = this.authService.user$.subscribe((user) => {
            this.user = user;
        });
        this.getMySatellites();
        this.satelliteService.getRefreshRequired().subscribe(() => {
            this.getMySatellites();
        });
    }

    private getMySatellites(): void {
        if (this.user?.username) {
            this.satellitesSub = this.profileService.getMySatellites(this.user?.username).subscribe((satellites) => {
                this.satellites = satellites;
                this.satellites?.forEach((satellite) => {
                    satellite.id = satellite._id;
                });
            });
        }
    }

    ngOnDestroy(): void {
        if (this.userSub) {
            this.userSub.unsubscribe();
        }
        if (this.satellitesSub) {
            this.satellitesSub.unsubscribe();
        }
        if (this.paramSub) {
            this.paramSub.unsubscribe();
        }
    }
}
