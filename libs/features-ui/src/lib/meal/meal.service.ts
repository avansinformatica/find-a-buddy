import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EntityService } from '@find-a-buddy/entity-ui';
import { ConfigService } from '@find-a-buddy/util-ui';
import { Meal } from './meal.model';

@Injectable({
  providedIn: 'root',
})
export class MealService extends EntityService<Meal> {
  constructor(private configService: ConfigService, http: HttpClient) {
    super(http, configService.getConfig().apiEndpoint, 'meal');
  }
}
