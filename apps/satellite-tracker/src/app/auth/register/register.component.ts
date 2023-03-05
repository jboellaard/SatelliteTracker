import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { IUser, UserRegistration } from 'shared/domain';
import { SnackBarService } from '../../utils/snack-bar.service';
import { AuthService } from '../auth.service';

@Component({
    selector: 'app-register',
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit {
    registerForm!: FormGroup;
    error: string | undefined = undefined;

    constructor(
        private formBuilder: FormBuilder,
        private authService: AuthService,
        private router: Router,
        private snackBarService: SnackBarService
    ) {}

    ngOnInit(): void {
        this.registerForm = this.formBuilder.group({
            username: new FormControl(null, [Validators.required, Validators.minLength(3)]),
            password: new FormControl(null, [Validators.required, Validators.minLength(3)]),
            emailAddress: new FormControl(null, [Validators.email]),
            latitude: new FormControl(null, [Validators.min(-90), Validators.max(90)]),
            longitude: new FormControl(null, [Validators.min(-180), Validators.max(180)]),
            profileDescription: new FormControl(null),
        }) as FormGroup;
    }

    getLocation(): void {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                this.registerForm.patchValue({
                    latitude: position.coords.latitude.toFixed(5),
                    longitude: position.coords.longitude.toFixed(5),
                });
            });
        } else {
            this.snackBarService.info('Geolocation is not supported by this browser.');
        }
    }

    onSubmit(): void {
        if (this.registerForm.valid) {
            let user = this.registerForm.value as UserRegistration;
            if (
                (this.registerForm.value.latitude && this.registerForm.value.longitude) ||
                this.registerForm.value.profileDescription
            ) {
                user.profileInfo = {
                    username: user.username,
                    location: {
                        coordinates: {
                            latitude: this.registerForm.value.latitude,
                            longitude: this.registerForm.value.longitude,
                        },
                    },
                    profileDescription: this.registerForm.value.profileDescription,
                };
            }
            this.authService.register(user).subscribe((res) => {
                if (res.username) {
                    this.router.navigate(['/']);
                } else {
                    this.error = res;
                }
            });
        }
    }
}
