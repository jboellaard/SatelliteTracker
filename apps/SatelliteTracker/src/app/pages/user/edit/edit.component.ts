import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from '../user.model';
import { UserService } from '../user.service';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss'],
})
export class UserEditComponent implements OnInit {
  componentId: string | null | undefined;
  componentExists: boolean = false;
  user: User | undefined;
  userName: string | undefined; // lokale kopie van username, voor page titel.

  constructor(private route: ActivatedRoute, private router: Router, private userService: UserService) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      7;
      this.componentId = params.get('id');
      if (this.componentId) {
        console.log('existing user');
        this.componentExists = true;
        this.user = {
          ...this.userService.getUserById(parseInt(this.componentId)),
        };
        this.userName = this.user!.name;
      } else {
        console.log('new user');
        this.componentExists = false;
        this.user = new User(undefined, '', '', new Date(), undefined);
      }
    });
  }

  onSubmit() {
    console.log('Submitting the form');
    if (this.componentExists) {
      this.user!.updatedAt = new Date();
      this.userService.updateUser(this.user!);
      this.router.navigate(['..']);
    } else {
      this.user!.createdAt = new Date();
      this.userService.addUser(this.user!);
      this.router.navigate(['..']);
    }
  }
}
