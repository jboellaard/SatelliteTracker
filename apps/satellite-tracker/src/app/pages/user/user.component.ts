import { CdkTableDataSourceInput } from '@angular/cdk/table';
import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { map, Observable } from 'rxjs';
import { IUser } from 'shared/domain';
import { UserService } from './user.service';

@Component({
    selector: 'app-user',
    templateUrl: './user.component.html',
    styleUrls: ['./user.component.scss'],
})
export class UserComponent {
    users: Observable<IUser[]> | undefined;
    constructor(private userService: UserService) {}

    // ngOnInit(): void {
    // this.users = this.userService.getAllUsers();
    // }

    // addUser(user: User) {
    //   this.userService.addUser(user);
    // }

    // removeUser(id: number) {
    //   //remove data from the table
    //   this.userService.delete(id);
    //   this.users = this.userService.getAllUsers();
    // }
}
