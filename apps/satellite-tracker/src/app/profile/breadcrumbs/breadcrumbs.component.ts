import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { UserIdentity } from 'shared/domain';
import { AuthService } from '../../auth/auth.service';
import { SatelliteService } from '../../pages/satellite/satellite.service';
import { ProfileService } from '../profile.service';

@Component({
    selector: 'app-breadcrumbs',
    templateUrl: './breadcrumbs.component.html',
    styleUrls: ['./breadcrumbs.component.scss'],
})
export class BreadcrumbsComponent {
    user: UserIdentity | undefined;
    admin = false;
    userSub: Subscription | undefined;
    paramSub: Subscription | undefined;
    currentSatellite: string | undefined;
    isProfileRoute = false;

    constructor(private authService: AuthService) {}

    ngOnInit(): void {
        this.userSub = this.authService.user$.subscribe((user) => {
            this.user = user;
            this.admin = user?.roles?.includes('admin') || false;
        });
    }

    ngOnDestroy(): void {
        if (this.userSub) {
            this.userSub.unsubscribe();
        }
        if (this.paramSub) {
            this.paramSub.unsubscribe();
        }
    }
}
