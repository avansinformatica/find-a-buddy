import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserInfo } from '@find-a-buddy/data';
import { AuthService } from '@find-a-buddy/auth-ui';
import { Subscription } from 'rxjs';

@Component({
  selector: 'fab-register',
  templateUrl: './register.component.html',
})
export class RegisterComponent implements OnInit, OnDestroy {
  subs!: Subscription;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.subs = this.authService
      .getUserFromLocalStorage()
      .subscribe((user: UserInfo | undefined) => {
        if (user) {
          console.log('User already logged in > to dashboard');
          this.router.navigate(['/']);
        }
      });
  }

  ngOnDestroy(): void {
    if (this.subs) {
      this.subs.unsubscribe();
    }
  }

  onFormSubmitted(registeredUser: UserInfo): void {
    this.authService
      .register(registeredUser)
      .subscribe((user: UserInfo | undefined) => {
        if (user) {
          console.log('user = ', user);
          this.router.navigate(['/']);
        }
      });
  }
}
