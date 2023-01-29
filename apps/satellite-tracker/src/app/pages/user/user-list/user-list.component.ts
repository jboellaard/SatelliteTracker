import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { IUser } from 'shared/domain';
import { UserService } from '../user.service';
import { BreakpointObserver } from '@angular/cdk/layout';

@Component({
    selector: 'app-user-list',
    templateUrl: './user-list.component.html',
    styleUrls: ['./user-list.component.scss', '../user.component.scss'],
})
export class UserListComponent implements OnInit, OnDestroy {
    // users: Observable<User[]> | undefined;
    usersArray: IUser[] = [];
    displayedColumns: string[] = ['name', 'latitude', 'longitude', 'createdAt', 'buttons'];
    sub!: Subscription;

    constructor(
        private userService: UserService,
        private router: Router,
        private breakpointObserver: BreakpointObserver
    ) {}

    ngOnInit(): void {
        this.sub = this.userService.getAll().subscribe((users) => {
            if (users) this.usersArray = users.sort((a, b) => (a.createdAt! < b.createdAt! ? 1 : -1));
        });
        this.breakpointObserver.observe(['(max-width: 650px)']).subscribe((result) => {
            if (result.matches) {
                this.displayedColumns = ['name', 'buttons'];
            } else {
                this.breakpointObserver.observe(['(max-width: 800px)']).subscribe((result) => {
                    if (result.matches) {
                        this.displayedColumns = ['name', 'latitude', 'longitude', 'buttons'];
                    } else {
                        this.displayedColumns = ['name', 'latitude', 'longitude', 'createdAt', 'buttons'];
                    }
                });
            }
        });
    }

    addUser(user: IUser) {
        this.userService.create(user);
    }

    removeUser(username: string) {
        this.userService.delete(username).subscribe(() => this.router.navigate(['/user-overview'])); // only for admin
        this.sub = this.userService.getAll().subscribe((users) => {
            if (users) this.usersArray = users.sort((a, b) => (a.createdAt! < b.createdAt! ? 1 : -1));
        });
    }

    ngOnDestroy() {
        this.sub.unsubscribe();
    }
}
