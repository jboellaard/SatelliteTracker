import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
    loginForm!: FormGroup;
    error: string | undefined = undefined;

    constructor(private authService: AuthService, private router: Router) {}

    ngOnInit(): void {
        this.loginForm = new FormGroup({
            username: new FormControl(null, [Validators.required, Validators.minLength(3)]),
            password: new FormControl(null, [Validators.required, Validators.minLength(3)]),
        });

        if (localStorage.getItem('token')) {
            localStorage.removeItem('token');
        }
    }

    onSubmit(): void {
        if (this.loginForm.valid) {
            this.authService.login(this.loginForm.value).subscribe((res) => {
                if (res.username) {
                    this.router.navigate(['/']);
                } else {
                    this.error = res;
                }
            });
        }
    }
}
