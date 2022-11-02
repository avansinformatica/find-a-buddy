import { UserInfo, UserRole } from '@find-a-buddy/data';
import { IEntity } from '@find-a-buddy/entity-ui';

export class User implements UserInfo, IEntity {
  emailAdress!: string;
  token: string | undefined;
  id?: number | undefined;
  firstName!: string;
  lastName!: string;
  roles!: UserRole[];
  isActive!: boolean;
  password!: string;
  phoneNumber!: string;

  constructor(values = {}) {
    // Assign all values to this objects properties
    Object.assign(this, values);
  }
}
