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
  username: string | null | undefined;
  componentExists: boolean = false;
  user: User | undefined;
  passwordCheck: string | undefined;

  constructor(private route: ActivatedRoute, private router: Router, private userService: UserService) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.username = params.get('username');
      if (this.username) {
        console.log('existing user');
        this.componentExists = true;
        var userByUsername = this.userService.getUserByUsername(this.username);
        if (userByUsername) {
          this.user = { ...userByUsername };
        } else {
          this.componentExists = false;
          this.user = new User(undefined, '', '', '', '', new Date(), undefined);
        }
      } else {
        console.log('new user');
        this.componentExists = false;
        this.user = new User(undefined, '', '', '', '', new Date(), undefined);
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
      if (this.userService.hasUniqueUsername(this.user!.username)) {
        this.user!.createdAt = new Date();
        this.userService.addUser(this.user!);
        this.router.navigate(['..']);
      } else {
        alert('Username already exists');
      }
    }
  }
}
