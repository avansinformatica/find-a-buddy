import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { UserLogin } from '@find-a-buddy/data';

@Component({
  selector: 'fab-auth-login-form',
  templateUrl: './login-form.component.html',
})
export class LoginFormComponent implements OnInit {
  loginForm!: FormGroup;
  @Output() formSubmitted = new EventEmitter<UserLogin>();

  ngOnInit(): void {
    this.loginForm = new FormGroup({
      // email: new FormControl(null, [Validators.required, Validators.email]),
      name: new FormControl(null, [
        Validators.required,
        Validators.minLength(5),
      ]),
      password: new FormControl(null, [
        Validators.required,
        Validators.minLength(3),
      ]),
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      const loginFormData: UserLogin = {
        // emailAdress: this.loginForm.value.email,
        name: this.loginForm.value.name,
        password: this.loginForm.value.password,
      };
      this.formSubmitted.emit(loginFormData);
    } else {
      console.error('loginForm invalid');
    }
  }
}
