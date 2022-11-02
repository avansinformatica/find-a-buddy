/**
 *
 */

import { UserInfo } from '@find-a-buddy/data';
import { IEntity } from '@find-a-buddy/entity-ui';

export class Meal implements IEntity {
  readonly id = 0;
  name = '';
  description = '';
  isActive = false;
  isVega = false;
  isVegan = false;
  isToTakeHome = false;
  dateTime = new Date();
  readonly createDate = undefined;
  readonly updateDate = undefined;
  imageUrl = '';
  readonly cook?: any;
  readonly participants: any;
}
