import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from '../user.model';
import { UserService } from '../user.service';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss'],
})
export class UserDetailComponent implements OnInit {
  username: string | null | undefined;
  user: User | undefined;
  satelliteColumns: string[] = ['id', 'name', 'createdAt', 'updatedAt', 'edit', 'delete'];
  satellites = [];
  constructor(private route: ActivatedRoute, private router: Router, private userService: UserService) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.username = params.get('username');
      if (this.username) {
        this.user = this.userService.getUserByUsername(this.username);
        if (!this.user) {
          this.router.navigate(['/users/new']);
        }
      } else {
        this.router.navigate(['/users/new']);
      }
    });
  }

  removeUser(id: number) {
    this.userService.removeUser(id);
    this.router.navigate(['/users']);
  }
}
