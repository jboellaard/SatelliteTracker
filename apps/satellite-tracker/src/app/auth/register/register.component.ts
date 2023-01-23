import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserRegistration } from 'shared/domain';
import { AuthService } from '../auth.service';

@Component({
    selector: 'app-register',
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit {
    registerForm!: FormGroup;

    constructor(private formBuilder: FormBuilder, private authService: AuthService, private router: Router) {}

    ngOnInit(): void {
        this.registerForm = this.formBuilder.group({
            username: new FormControl(null, [Validators.required, Validators.minLength(3)]),
            password: new FormControl(null, [Validators.required, Validators.minLength(3)]),
            emailAddress: new FormControl(null, [Validators.required, Validators.email]),
        }) as FormGroup;
    }

    onSubmit(): void {
        if (this.registerForm.valid) {
            console.log(this.registerForm.value);
            this.authService.register(this.registerForm.value).subscribe((res) => {
                console.log(res);
                if (res) {
                    this.router.navigate(['/login']);
                }
            });
        } else {
            console.log('invalid form');
        }
    }
}
