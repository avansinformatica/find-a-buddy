import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EntityService } from '@find-a-buddy/entity-ui';
import { UserInfo } from '@find-a-buddy/data';
import { ConfigService } from '@find-a-buddy/util-ui';

@Injectable({
  providedIn: 'root',
})
export class UserService extends EntityService<UserInfo> {
  constructor(private config: ConfigService, http: HttpClient) {
    super(http, config.getApiEndpoint(), 'user');
    console.log('UserService ' + config.getApiEndpoint());
  }
}
