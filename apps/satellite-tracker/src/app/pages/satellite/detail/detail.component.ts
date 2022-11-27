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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public userService: UserService,
    public satelliteService: SatelliteService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.id = params.get('satelliteId');
      this.username = this.userService.getById(parseInt(params.get('userId')!))?.username;
      if (this.id) {
        this.satellite = this.satelliteService.getById(parseInt(this.id));
        if (!this.satellite) {
          this.router.navigate(['new']);
        }
      } else {
        this.router.navigate(['new']);
      }
    });
  }

  removeSatellite(id: number) {
    this.satelliteService.delete(id);
    this.router.navigate(['..']);
  }
}
