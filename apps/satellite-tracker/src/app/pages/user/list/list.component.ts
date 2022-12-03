import { CdkTableDataSourceInput } from '@angular/cdk/table';
import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { map, Observable, Subscription } from 'rxjs';
import { User } from 'shared/domain';
import { UserService } from '../user.service';

@Component({
  selector: 'app-user',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss', '../user.component.scss'],
})
export class UserListComponent implements OnInit {
  // users: Observable<User[]> | undefined;
  usersArray: User[] = [];
  displayedColumns: string[] = ['id', 'name', 'emailAddress', 'latitude', 'longitude', 'createdAt', 'buttons'];
  sub!: Subscription;

  constructor(private userService: UserService, private router: Router) {}

  ngOnInit(): void {
    this.sub = this.userService.list().subscribe((users) => {
      if (users) this.usersArray = users;
    });
  }

  addUser(user: User) {
    this.userService.create(user);
  }

  removeUser(id: number) {
    this.userService.delete(id).subscribe(() => this.router.navigate(['/users']));
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
