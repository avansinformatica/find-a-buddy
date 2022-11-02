import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { UserInfo } from '@find-a-buddy/data';
import { UserService } from '../user.service';

@Component({
  selector: 'fab-user-list',
  templateUrl: './user-list.component.html',
})
export class UserListComponent implements OnInit {
  users$!: Observable<UserInfo[] | null>;

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.users$ = this.userService.list();
  }
}
