import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../user/user.service';
import { SatelliteImplemented } from '../satellite.model';
import { SatelliteService } from '../satellite.service';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss'],
})
export class SatelliteDetailComponent implements OnInit {
  username: string | null | undefined;
  id: string | null | undefined;
  satellite: SatelliteImplemented | undefined;
  userId: number | undefined;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public userService: UserService,
    public satelliteService: SatelliteService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.id = params.get('satelliteId');
      this.userId = parseInt(params.get('userId')!);
      this.username = this.userService.getById(this.userId)?.username;
      if (this.id) {
        this.satellite = this.satelliteService.getById(parseInt(this.id));
        if (!this.satellite) {
          this.router.navigate([`/users/${this.userId}/satellites/new`]);
        }
      } else {
        this.router.navigate([`/users/${this.userId}/satellites/new`]);
      }
    });
  }

  removeSatellite(id: number) {
    this.satelliteService.delete(id);
    this.router.navigate([`/users/${this.userId}`]);
  }
}
