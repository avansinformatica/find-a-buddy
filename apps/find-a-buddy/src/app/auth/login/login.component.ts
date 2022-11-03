import { Component, OnDestroy, OnInit } from '@angular/core'
import { Router } from '@angular/router'
import { UserIdentity, UserInfo, UserCredentials } from '@find-a-buddy/data'
import { AuthService } from '@find-a-buddy/auth-ui'
import { Subscription } from 'rxjs'

@Component({
    selector: 'fab-login',
    templateUrl: './login.component.html',
})
export class LoginComponent implements OnInit, OnDestroy {
    subs!: Subscription

    constructor(private authService: AuthService, private router: Router) {}

    ngOnInit(): void {
        this.subs = this.authService
            .getUserFromLocalStorage()
            .subscribe((user: UserInfo | undefined) => {
                if (user) {
                    console.log('User already logged in > to dashboard')
                    this.router.navigate(['/'])
                }
            })
    }

    ngOnDestroy(): void {
        if (this.subs) {
            this.subs.unsubscribe()
        }
    }

    onFormSubmitted(formData: UserCredentials): void {
        console.log(formData.username, formData.password)
        this.authService
            .login(formData)
            .subscribe((user: UserIdentity | undefined) => {
                if (user) {
                    console.log('Logged in')
                    this.router.navigate(['/'])
                }
                // this.submitted = false
            })
    }
}
