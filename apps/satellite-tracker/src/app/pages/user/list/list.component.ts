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
  styleUrls: ['./list.component.scss'],
})
export class UserListComponent implements OnInit {
  // users: Observable<User[]> | undefined;
  usersArray: User[] = [];
  displayedColumns: string[] = ['id', 'name', 'emailAddress', 'latitude', 'longitude', 'createdAt', 'buttons'];
  // dataSource = new MatTableDataSource<User>()!;
  sub!: Subscription;

  // thingsAsMatTableDataSource$ = this.userService
  //   .getAllUsers()
  //   .pipe(
  //     map((things) => {
  //       const dataSource = this.dataSource;
  //       dataSource.data = things;
  //       return dataSource;
  //     })
  //   )
  //   .subscribe((dataSource) => {
  //     this.dataSource = dataSource;
  //   });

  constructor(private userService: UserService, private router: Router) {}

  ngOnInit(): void {
    // this.users = this.userService.getAllUsers();
    this.sub = this.userService.list().subscribe((users) => {
      if (users) this.usersArray = users;
    });
  }

  // addUser(user: User) {
  //   this.userService.addUser(user);
  // }

  removeUser(id: number) {
    this.userService.delete(id).subscribe(() => this.router.navigate(['/users']));
    //remove data from the table
    console.log('deleted?');
    // this.router.navigate(['/users']);
    // this.userService.removeUser(id);
    // this.users = this.userService.getAllUsers();
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
