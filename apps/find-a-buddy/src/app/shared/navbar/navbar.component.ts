import { Component, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from '@find-a-buddy/auth-ui';
import { UserInfo } from '@find-a-buddy/data';

@Component({
  selector: 'fab-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent implements OnInit {
  @Input() title!: string;
  isNavbarCollapsed = true;
  loggedInUser$!: Observable<UserInfo | undefined>;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.loggedInUser$ = this.authService.currentUser$;
  }

  logout(): void {
    this.authService.logout();
  }
}
