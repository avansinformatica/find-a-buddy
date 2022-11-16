import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { UserIdentity, UserInfo, UserLogin } from '@find-a-buddy/data';
import { Router } from '@angular/router';
import { map, catchError, switchMap } from 'rxjs/operators';
import { AlertService, ConfigService } from '@find-a-buddy/util-ui';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  public currentUser$ = new BehaviorSubject<UserInfo | undefined>(undefined);
  private readonly CURRENT_USER = 'currentuser';
  private readonly headers = new HttpHeaders({
    'Content-Type': 'application/json',
  });

  constructor(
    private configService: ConfigService,
    private alertService: AlertService,
    private http: HttpClient,
    private router: Router
  ) {
    console.log(
      'AuthService constructor ' + configService.getConfig().apiEndpoint
    );
    // Check of we al een ingelogde user hebben
    // Zo ja, check dan op de backend of het token nog valid is.
    // Het token kan namelijk verlopen zijn. Indien verlopen
    // retourneren we meteen een nieuw token.
    this.getUserFromLocalStorage()
      .pipe(
        // switchMap is overbodig als we validateToken() niet gebruiken...
        switchMap((user: UserInfo | undefined) => {
          if (user) {
            console.log('User found in local storage');
            this.currentUser$.next(user);
            // return this.validateToken(user);
            return of(user);
          } else {
            console.log(`No current user found`);
            return of(undefined);
          }
        })
      )
      .subscribe(() => console.log('Startup auth done'));
  }

  login(formData: UserLogin): Observable<UserIdentity | undefined> {
    console.log(
      `login at ${this.configService.getConfig().apiEndpoint}auth/login`
    );

    return this.http
      .post<UserIdentity>(
        `${this.configService.getConfig().apiEndpoint}auth/login`,
        formData,
        {
          headers: this.headers,
        }
      )
      .pipe(
        map((data: any) => data.result),
        map((user: UserInfo) => {
          this.saveUserToLocalStorage(user);
          this.currentUser$.next(user);
          this.alertService.success('You have been logged in');
          return user;
        }),
        catchError((error) => {
          console.log('error:', error);
          console.log('error.message:', error.message);
          console.log('error.error.message:', error.error.message);
          this.alertService.error(error.error.message || error.message);
          return of(undefined);
        })
      );
  }

  register(userData: UserInfo): Observable<UserInfo | undefined> {
    console.log(
      `register at ${this.configService.getConfig().apiEndpoint}user`
    );
    console.log(userData);
    return this.http
      .post<UserInfo>(
        `${this.configService.getConfig().apiEndpoint}user`,
        userData,
        {
          headers: this.headers,
        }
      )
      .pipe(
        map((user) => {
          // this.saveUserToLocalStorage(user)
          // this.currentUser$.next(user)
          this.alertService.success('You have been registered');
          return user;
        }),
        catchError((error) => {
          console.log('error:', error);
          console.log('error.message:', error.message);
          console.log('error.error.message:', error.error.message);
          this.alertService.error(error.error.message || error.message);
          return of(undefined);
        })
      );
  }

  logout(): void {
    this.router
      .navigate(['/'])
      .then((success) => {
        // true when canDeactivate allows us to leave the page.
        if (success) {
          console.log('logout - removing local user info');
          localStorage.removeItem(this.CURRENT_USER);
          this.currentUser$.next(undefined);
          this.alertService.success('You have been logged out.');
        } else {
          console.log('navigate result:', success);
        }
      })
      .catch((error) => console.log('not logged out!'));
  }

  getUserFromLocalStorage(): Observable<UserInfo | undefined> {
    const userData = localStorage.getItem(this.CURRENT_USER);
    if (userData) {
      const localUser = JSON.parse(userData);
      return of(localUser);
    } else {
      return of(undefined);
    }
  }

  private saveUserToLocalStorage(user: UserInfo): void {
    localStorage.setItem(this.CURRENT_USER, JSON.stringify(user));
  }

  userMayEdit(itemUserId: string): Observable<boolean> {
    console.log('userMayEdit');
    return this.currentUser$.pipe(
      map((user: UserInfo | undefined) =>
        user ? user.id === itemUserId : false
      )
    );
  }

  getAuthorizationToken(): string | undefined {
    const userData = localStorage.getItem(this.CURRENT_USER);
    if (userData) {
      const user: UserInfo = JSON.parse(userData);

      console.log('LET OP, TO DO!');
      return user.name; // user.token;
    }
    return undefined;
  }
}
