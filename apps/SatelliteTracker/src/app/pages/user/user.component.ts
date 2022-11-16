import { Component, OnInit } from '@angular/core';
import { User } from './user.model';
import { UserService } from './user.service';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss'],
})
export class UserComponent implements OnInit {
  users: User[] | undefined;
  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.users = this.userService.getAllUsers();
  }
}
