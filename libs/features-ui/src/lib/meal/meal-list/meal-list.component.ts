import { Component } from '@angular/core';
import { AuthService } from '@find-a-buddy/auth-ui';
import { BaseListComponent } from '@find-a-buddy/entity-ui';
import { AlertService } from '@find-a-buddy/util-ui';
import { Meal } from '../meal.model';
import { MealService } from '../meal.service';

@Component({
  selector: 'fab-feature-meal-list',
  templateUrl: './meal-list.component.html',
  styles: [],
})
export class MealListComponent extends BaseListComponent<Meal> {
  constructor(
    mealService: MealService,
    alertService: AlertService,
    authService: AuthService
  ) {
    super(mealService, alertService, authService);
  }
}
