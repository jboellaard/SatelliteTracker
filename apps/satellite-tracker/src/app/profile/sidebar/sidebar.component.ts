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
    admin = false;
    satellites: ISatellite[] | undefined;
    userSub: Subscription | undefined;
    satellitesSub: Subscription | undefined;
    paramSub: Subscription | undefined;
    currentSatellite: string | undefined;
    isProfileRoute = false;

    constructor(
        private satelliteService: SatelliteService,
        private profileService: ProfileService,
        private authService: AuthService
    ) {}

    ngOnInit(): void {
        this.userSub = this.authService.user$.subscribe((user) => {
            this.user = user;
            this.admin = user?.roles?.includes('admin') || false;
        });
        this.getMySatellites();
        this.satelliteService.getRefreshRequired().subscribe(() => {
            this.getMySatellites();
        });
    }

    private getMySatellites(): void {
        if (this.user?.username) {
            this.satellitesSub = this.profileService.getCreated(this.user?.username).subscribe((satellites) => {
                this.satellites = satellites;
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
