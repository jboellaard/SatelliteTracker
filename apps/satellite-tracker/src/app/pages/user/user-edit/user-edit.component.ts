import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { catchError, of, Subscription, switchMap, tap } from 'rxjs';
import { APIResponse, IUser, IUserInfo } from 'shared/domain';
import { UserService } from '../user.service';

@Component({
    selector: 'app-user-edit',
    templateUrl: './user-edit.component.html',
    styleUrls: ['./user-edit.component.scss'],
})
export class UserEditComponent implements OnInit {
    id: string | null | undefined;
    componentExists = false;
    // user: User | undefined;
    // passwordCheck: string | undefined;

    title = '';
    user!: IUser;
    userid!: number | undefined;
    username!: string;
    httpOptions: any;
    debug = false;

    subscriptionParams!: Subscription;

    constructor(private route: ActivatedRoute, private router: Router, private userService: UserService) {}

    ngOnInit(): void {
        this.subscriptionParams = this.route.paramMap
            .pipe(
                tap(console.log),
                switchMap((params: ParamMap) => {
                    if (!params.get('username')) {
                        return of({
                            username: '',
                            password: '',
                            location: { coordinates: { latitude: 0, longitude: 0 } },
                            profileDescription: '',
                            emailAddress: '',
                        } as IUser);
                    } else {
                        this.componentExists = true;
                        return this.userService.getByUsername(params.get('username')!);
                    }
                })
            )
            .subscribe((user: IUser) => {
                console.log(user);
                this.user = user;
                this.username = this.user.username;
            });
    }

    onSubmit(): void {
        if (this.user.id) {
            this.userService
                .update(this.user, this.httpOptions)
                .pipe(
                    catchError((error) => {
                        console.log(error);
                        // this.alertService.error(error.message);
                        return of(false);
                    })
                )
                .subscribe((success) => {
                    console.log(success);
                    if (success) {
                        this.router.navigate(['..'], { relativeTo: this.route });
                    }
                });
        } else {
            this.userService
                .create(this.user, this.httpOptions)
                .pipe(
                    catchError((error) => {
                        console.log(error);
                        // this.alertService.error(error.message);
                        return of(false);
                    })
                )
                .subscribe((success) => {
                    console.log(success);
                    if (success) {
                        this.router.navigate(['..'], { relativeTo: this.route });
                    }
                });
        }
    }

    ngOnDestroy(): void {
        this.subscriptionParams.unsubscribe();
    }
}
