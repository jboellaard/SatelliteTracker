import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { catchError, of, Subscription, switchMap, tap } from 'rxjs';
import { IUser, IUserInfo } from 'shared/domain';
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

    // ngOnInit(): void {
    //   this.route.paramMap.subscribe((params) => {
    //     this.id = params.get('id');
    //     if (this.id) {
    //       console.log('existing user');
    //       this.componentExists = true;
    //       var userByUsername = this.userService.getById(parseInt(this.id));
    //       if (userByUsername) {
    //         this.user = { ...userByUsername };
    //       } else {
    //         this.componentExists = false;
    //         this.user = new User({
    //           username: '',
    //           password: '',
    //           location: { latitude: 0, longitude: 0 },
    //           profileDescription: '',
    //           emailAddress: '',
    //         });
    //       }
    //     } else {
    //       console.log('new user');
    //       this.componentExists = false;
    //       this.user = new User({
    //         username: '',
    //         password: '',
    //         location: { latitude: 0, longitude: 0 },
    //         profileDescription: '',
    //         emailAddress: '',
    //       });
    //     }
    //   });
    // }

    // onSubmit() {
    //   console.log('Submitting the form');
    //   if (this.componentExists) {
    //     this.userService.update(this.user!);
    //     this.router.navigate(['..']);
    //   } else {
    //     if (this.userService.hasUniqueUsername(this.user!.username)) {
    //       this.user!.createdAt = new Date();
    //       this.userService.create(this.user!);
    //       this.router.navigate(['..']);
    //     } else {
    //       alert('Username already exists');
    //     }
    //   }
    // }

    // ngOnInit(): void {
    //   this.route.paramMap.subscribe((params) => {
    //     this.id = params.get('id');
    //     if (this.id) {
    //       console.log('existing user');
    //       this.componentExists = true;
    //       var userByUsername = this.userService.getUserById(this.id);
    //       if (userByUsername) {
    //         this.user = { ...userByUsername };
    //       } else {
    //         this.componentExists = false;
    //         this.user = {
    //           id: 0,
    //           username: '',
    //           password: '',
    //           createdAt: new Date(),
    //           profileDescription: '',
    //           updatedAt: new Date(),
    //           emailAddress: '',
    //         };
    //         // this.user = new User(undefined, '', '', '', '', new Date(), undefined);
    //       }
    //     } else {
    //       console.log('new user');
    //       this.componentExists = false;
    //       // this.user = new User(undefined, '', '', '', '', new Date(), undefined);
    //     }
    //   });
    // }

    ngOnInit(): void {
        // Haal de user op voor edit
        this.subscriptionParams = this.route.paramMap
            .pipe(
                tap(console.log),
                switchMap((params: ParamMap) => {
                    // als we een nieuw item maken is er geen 'id'
                    if (!params.get('id')) {
                        return of({
                            username: '',
                            password: '',
                            location: { latitude: 0, longitude: 0 },
                            profileDescription: '',
                            emailAddress: '',
                        } as IUser);
                    } else {
                        this.componentExists = true;
                        return this.userService.read(params.get('id')!);
                    }
                }),
                tap(console.log)
            )
            .subscribe((user: IUserInfo) => {
                this.user = user;
                this.username = user.username;
            });
    }

    // Save user via the service
    onSubmit(): void {
        console.log('onSubmit', this.user);

        if (this.user.id) {
            console.log('update user');
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
            // A user without id has not been saved to the database before.
            console.log('create user');
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
