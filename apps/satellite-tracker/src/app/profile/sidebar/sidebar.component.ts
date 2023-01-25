import { Component } from '@angular/core';
import { UserIdentity, ISatellite } from 'shared/domain';
import { AuthService } from '../../auth/auth.service';
import { ProfileService } from '../profile.service';

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent {
    user: UserIdentity | undefined;
    satellites: ISatellite[] | undefined;

    constructor(private profileService: ProfileService, private authService: AuthService) {}

    ngOnInit(): void {
        this.authService.user$.subscribe((user) => {
            this.user = user;
        });
        if (this.user?.username) {
            this.profileService.getMySatellites(this.user?.username).subscribe((satellites) => {
                this.satellites = satellites;
                this.satellites?.forEach((satellite) => {
                    satellite.id = satellite._id;
                });
            });
        }
    }
}
