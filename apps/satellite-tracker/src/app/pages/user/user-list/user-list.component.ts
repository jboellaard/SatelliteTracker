import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AdminUserInfo } from 'shared/domain';
import { UserService } from '../user.service';
import { BreakpointObserver } from '@angular/cdk/layout';
import { MatDialog } from '@angular/material/dialog';
import { SnackBarService } from '../../../utils/snack-bar.service';
import { DeleteDialogComponent } from '../../../utils/delete-dialog/delete-dialog.component';

@Component({
    selector: 'app-user-list',
    templateUrl: './user-list.component.html',
    styleUrls: ['./user-list.component.scss'],
})
export class UserListComponent implements OnInit, OnDestroy {
    usersArray: AdminUserInfo[] = [];
    displayedColumns: string[] = ['name', 'email', 'roles', 'createdAt', 'buttons'];
    userSub!: Subscription;

    constructor(
        private userService: UserService,
        private breakpointObserver: BreakpointObserver,
        private dialog: MatDialog,
        private snackBar: SnackBarService
    ) {}

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

    removeUser(username: string) {
        const dialogRef = this.dialog.open(DeleteDialogComponent, {
            data: {
                message:
                    'Are you sure you want to delete this user and their satellites? \
                    This action cannot be reversed!',
            },
        });
        dialogRef.afterClosed().subscribe((ok) => {
            if (ok == 'ok') {
                this.userService.delete(username).subscribe((result) => {
                    if (result) {
                        this.snackBar.success('User successfully deleted');
                    } else {
                        this.snackBar.error('Something went wrong, please try again later');
                    }
                });
            }
        });
    }

    ngOnDestroy() {
        this.userSub.unsubscribe();
    }
}
