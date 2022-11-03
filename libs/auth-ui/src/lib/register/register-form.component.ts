import { Component, EventEmitter, OnInit, Output } from '@angular/core'
import {
    AbstractControl,
    FormBuilder,
    FormControl,
    FormGroup,
    Validators,
} from '@angular/forms'
import { UserRegistration } from '@find-a-buddy/data'

/**
 *
 */
interface UserInfoFormGroup extends FormGroup {
    value: UserRegistration
    controls: {
        username: AbstractControl
        password: AbstractControl
        emailAdress: AbstractControl
    }
}

/**
 *
 */
@Component({
    selector: 'fab-auth-register-form',
    templateUrl: './register-form.component.html',
})
export class RegisterFormComponent implements OnInit {
    registerForm!: FormGroup
    @Output() formSubmitted = new EventEmitter<UserRegistration>()

    constructor(private formBuilder: FormBuilder) {}

    ngOnInit(): void {
        this.registerForm = this.formBuilder.group({
            username: new FormControl(null, [Validators.required]),
            emailAdress: new FormControl(null, [
                Validators.required,
                Validators.email,
            ]),
            password: new FormControl(null, [
                Validators.required,
                Validators.minLength(3),
            ]),
        }) as FormGroup
    }

    onSubmit(): void {
        if (this.registerForm.valid) {
            const registeredUser: UserRegistration = this.registerForm.value
            this.formSubmitted.emit(registeredUser)
        } else {
            console.error('registerForm invalid')
        }
    }
}
