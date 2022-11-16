import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss'],
})
export class EditComponent implements OnInit {
  componentId: string | null | undefined;
  componentExists: boolean = false;

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.componentId = params.get('id');
      if (this.componentId) {
        // Bestaande user
        console.log('Bestaande component');
        this.componentExists = true;
      } else {
        // Nieuwe user
        console.log('Nieuwe component');
        this.componentExists = false;
      }
    });
  }
}
