import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { UserIdentity } from 'shared/domain';

@Component({
    selector: 'app-register',
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit {
    registerForm!: FormGroup;
    @Output() formSubmitted = new EventEmitter<UserIdentity>();

    constructor(private formBuilder: FormBuilder) {}

    ngOnInit(): void {
        this.registerForm = this.formBuilder.group({
            username: new FormControl(null, [Validators.required, Validators.minLength(3)]),
            password: new FormControl(null, [Validators.required, Validators.minLength(3)]),
            emailAddress: new FormControl(null, [Validators.required, Validators.email]),
        }) as FormGroup;
    }

    onSubmit(): void {
        if (this.registerForm.valid) {
            this.formSubmitted.emit(this.registerForm.value);
        } else {
            console.log('invalid form');
        }
    }
}
