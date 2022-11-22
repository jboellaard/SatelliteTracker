import { Component, OnInit } from '@angular/core';
import { User } from './user.model';
import { UserService } from './user.service';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss'],
})
export class UserComponent implements OnInit {
  users: User[] = [];
  displayedColumns: string[] = ['id', 'name', 'latitude', 'longitude', 'createdAt', 'updatedAt', 'buttons'];
  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.users = this.userService.getAllUsers();
  }
  addUser(user: User) {
    this.userService.addUser(user);
  }

  removeUser(id: number) {
    //remove data from the table
    this.userService.removeUser(id);
    this.users = this.userService.getAllUsers();
  }
}
