import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../auth.service';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
    loginForm!: FormGroup;
    submitted = false;

    constructor(private authService: AuthService, private router: Router) {}

    ngOnInit(): void {
        this.loginForm = new FormGroup({
            username: new FormControl(null, [Validators.required, Validators.minLength(3)]),
            password: new FormControl(null, [Validators.required, Validators.minLength(3)]),
        });

        if (localStorage.getItem('token')) {
            localStorage.removeItem('token');
            // console.log('User already logged in');
            // this.router.navigate(['/']);
        }
    }

    onSubmit(): void {
        if (this.loginForm.valid) {
            this.submitted = true;
            this.authService.login(this.loginForm.value).subscribe((res) => {
                if (res) {
                    this.router.navigate(['/']);
                }
                this.submitted = false;
            });
        } else {
            console.log('invalid form');
            this.submitted = false;
        }
    }
}
