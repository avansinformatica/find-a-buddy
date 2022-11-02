import { Component } from '@angular/core';
import { AuthService } from '@find-a-buddy/auth-ui';
import { BaseListComponent } from '@find-a-buddy/entity-ui';
import { AlertService } from '@find-a-buddy/util-ui';
import { Meal } from '../meal.model';
import { MealService } from '../meal.service';

@Component({
  selector: 'fab-feature-meal-grid',
  templateUrl: './meal-grid.component.html',
  styles: [],
})
export class MealGridComponent extends BaseListComponent<Meal> {
  filtersAreaIsCollapsed = true;

  constructor(
    mealService: MealService,
    alertService: AlertService,
    authService: AuthService
  ) {
    super(mealService, alertService, authService);
  }

  delete(movieId: string): void {
    console.log('delete ' + movieId);
  }
}
