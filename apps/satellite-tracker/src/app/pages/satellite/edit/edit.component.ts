import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Id } from 'shared/domain';
import { SatelliteImplemented } from '../../satellite/satellite.model';
import { UserService } from '../../user/user.service';
import { SatelliteService } from '../satellite.service';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss'],
})
export class SatelliteEditComponent implements OnInit {
  componentId: string | null | undefined;
  componentExists: boolean = false;
  id!: Id | null | undefined;
  satellite: SatelliteImplemented | undefined;
  userId!: Id | null | undefined;
  username: string | undefined;

  // constructor(private route: ActivatedRoute, private router: Router) {}

  // ngOnInit(): void {
  //   this.route.paramMap.subscribe((params) => {
  //     this.componentId = params.get('id');
  //     if (this.componentId) {
  //       // Bestaande user
  //       console.log('Bestaande component');
  //       this.componentExists = true;
  //     } else {
  //       // Nieuwe user
  //       console.log('Nieuwe component');
  //       this.componentExists = false;
  //     }
  //   });
  // }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private satelliteService: SatelliteService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.id = parseInt(params.get('satelliteId')!);
      this.userId = parseInt(params.get('userId')!);
      this.username = this.userService.getById(this.userId!)?.username;
      if (this.id) {
        console.log('existing satellite');
        this.componentExists = true;
        var satellite = this.satelliteService.getById(this.id);
        if (satellite) {
          this.satellite = { ...satellite };
        } else {
          this.componentExists = false;
          this.satellite = new SatelliteImplemented({
            name: '',
            purpose: '',
            mass: 0,
            radiusOfBase: 0,
            radiusOfParts: 0,
            colorOfBase: '#000000',
            orbit: undefined,
            createdBy: params.get('userId')!,
          });
        }
      } else {
        console.log('new satellite');
        this.componentExists = false;
        this.satellite = new SatelliteImplemented({
          name: '',
          purpose: '',
          mass: 0,
          radiusOfBase: 0,
          radiusOfParts: 0,
          colorOfBase: '#000000',
          orbit: undefined,
          createdBy: params.get('userId')!,
        });
      }
    });
  }

  onSubmit() {
    console.log('Submitting the form');
    if (this.componentExists) {
      this.satelliteService.update(this.satellite!);
      this.router.navigate(['/users/' + this.userId]);
    } else {
      this.satelliteService.create(this.satellite!);
      this.router.navigate(['/users/' + this.userId]);
    }
  }
}
