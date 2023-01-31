import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AdminUserInfo, IUser, UserIdentity } from 'shared/domain';
import { UserService } from '../user.service';
import { BreakpointObserver } from '@angular/cdk/layout';

@Component({
    selector: 'app-user-list',
    templateUrl: './user-list.component.html',
    styleUrls: ['./user-list.component.scss', '../user.component.scss'],
})
export class UserListComponent implements OnInit, OnDestroy {
    // users: Observable<User[]> | undefined;
    usersArray: AdminUserInfo[] = [];
    displayedColumns: string[] = ['name', 'email', 'roles', 'createdAt', 'buttons'];
    userSub!: Subscription;

    constructor(private userService: UserService, private breakpointObserver: BreakpointObserver) {}

    ngOnInit(): void {
        this.getUsers();

        this.userService.getRefreshRequired().subscribe(() => {
            this.getUsers();
        });
        this.breakpointObserver.observe(['(max-width: 790px)']).subscribe((result) => {
            if (result.matches) {
                this.displayedColumns = ['name', 'buttons'];
            } else {
                this.breakpointObserver.observe(['(max-width: 1000px)']).subscribe((result) => {
                    if (result.matches) {
                        this.displayedColumns = ['name', 'email', 'buttons'];
                    } else {
                        this.breakpointObserver.observe(['(max-width: 1100px)']).subscribe((result) => {
                            if (result.matches) {
                                this.displayedColumns = ['name', 'email', 'createdAt', 'buttons'];
                            } else {
                                this.displayedColumns = ['name', 'email', 'roles', 'createdAt', 'buttons'];
                            }
                        });
                    }
                });
            }
        });
    }

    private getUsers() {
        this.userSub = this.userService.getAllIdentities().subscribe((users) => {
            if (users) this.usersArray = users.sort((a, b) => (a.createdAt! < b.createdAt! ? 1 : -1));
        });
    }

    addUser(user: IUser) {
        this.userService.create(user);
    }

    removeUser(username: string) {
        // this.userService.delete(username).subscribe(() => this.router.navigate(['/user-overview'])); // TODO: implement reload required
        // this.sub = this.userService.getAllIdentities().subscribe((users) => {
        //     if (users) this.usersArray = users.sort((a, b) => (a.createdAt! < b.createdAt! ? 1 : -1));
        // });
    }

    ngOnDestroy() {
        this.userSub.unsubscribe();
    }
}
