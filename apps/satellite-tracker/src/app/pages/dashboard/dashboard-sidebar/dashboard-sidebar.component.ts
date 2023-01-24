import { Component, OnInit } from '@angular/core';
import { UserIdentity, ISatellite } from 'shared/domain';
import { AuthService } from '../../../auth/auth.service';
import { DashboardService } from '../dashboard.service';

@Component({
    selector: 'app-dashboard-sidebar',
    templateUrl: './dashboard-sidebar.component.html',
    styleUrls: ['./dashboard-sidebar.component.scss'],
})
export class DashboardSidebarComponent implements OnInit {
    user: UserIdentity | undefined;
    satellites: ISatellite[] | undefined;

    constructor(private dashBoardService: DashboardService, private authService: AuthService) {}

    ngOnInit(): void {
        this.authService.user$.subscribe((user) => {
            this.user = user;
        });
        if (this.user?.username) {
            this.dashBoardService.getMySatellites(this.user?.username).subscribe((satellites) => {
                this.satellites = satellites;
                this.satellites?.forEach((satellite) => {
                    satellite.id = satellite._id;
                });
            });
        }
    }
}
