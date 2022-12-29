import { CdkTableDataSourceInput } from '@angular/cdk/table';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { map, Observable, Subscription } from 'rxjs';
import { Id, IUser } from 'shared/domain';
import { UserService } from '../user.service';

@Component({
    selector: 'app-user-list',
    templateUrl: './user-list.component.html',
    styleUrls: ['./user-list.component.scss', '../user.component.scss'],
})
export class UserListComponent implements OnInit, OnDestroy {
    // users: Observable<User[]> | undefined;
    usersArray: IUser[] = [];
    displayedColumns: string[] = ['id', 'name', 'latitude', 'longitude', 'createdAt', 'buttons'];
    sub!: Subscription;

    constructor(private userService: UserService, private router: Router) {}

    ngOnInit(): void {
        this.sub = this.userService.getAll().subscribe((users) => {
            console.log(users);
            if (users) this.usersArray = users;
        });
    }

    addUser(user: IUser) {
        this.userService.create(user);
    }

    removeUser(username: string) {
        this.userService.delete(username).subscribe(() => this.router.navigate(['/users']));
        this.sub = this.userService.getAll().subscribe((users) => {
            if (users) this.usersArray = users;
        });
    }

    ngOnDestroy() {
        this.sub.unsubscribe();
    }
}
