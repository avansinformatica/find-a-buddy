import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { UserInfo } from '@find-a-buddy/data';

/**
 *
 */
interface UserInfoFormGroup extends FormGroup {
  value: UserInfo;
  controls: {
    firstName: AbstractControl;
    lastName: AbstractControl;
    password: AbstractControl;
    emailAdress: AbstractControl;

    // phoneNumber?: AbstractControl
    // id?: number
    // roles: UserRole[]
    // isActive: boolean
    // token: string | undefined
  };
}

/**
 *
 */
@Component({
  selector: 'fab-auth-register-form',
  templateUrl: './register-form.component.html',
})
export class RegisterFormComponent implements OnInit {
  registerForm!: FormGroup;
  @Output() formSubmitted = new EventEmitter<UserInfo>();

  constructor(private formBuilder: FormBuilder) {}

  ngOnInit(): void {
    this.registerForm = this.formBuilder.group({
      firstName: new FormControl(null, [Validators.required]),
      lastName: new FormControl(null, [Validators.required]),
      emailAdress: new FormControl(null, [
        Validators.required,
        Validators.email,
      ]),
      password: new FormControl(null, [
        Validators.required,
        Validators.minLength(3),
      ]),
    }) as FormGroup;
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      const registeredUser: UserInfo = this.registerForm.value;
      this.formSubmitted.emit(registeredUser);
    } else {
      console.error('registerForm invalid');
    }
  }
}
