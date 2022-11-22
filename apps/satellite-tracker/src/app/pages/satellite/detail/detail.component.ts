import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss'],
})
export class SatelliteDetailComponent implements OnInit {
  componentId: string | null | undefined;
  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.componentId = params.get('id');
      if (this.componentId) {
        // Bestaande user
        console.log('Bestaande component');
      } else {
        // Nieuwe user
        console.log('Nieuwe component');
      }
    });
  }
}
