import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '@find-a-buddy/auth-ui';
import { BaseEditComponent } from '@find-a-buddy/entity-ui';
import { AlertService } from '@find-a-buddy/util-ui';
import { Meal } from '../meal.model';
import { MealService } from '../meal.service';

@Component({
  selector: 'fab-feature-meal-edit',
  templateUrl: './meal-edit.component.html',
})
export class MealEditComponent extends BaseEditComponent<Meal> {
  constructor(
    private mealService: MealService,
    alertService: AlertService,
    authService: AuthService,
    route: ActivatedRoute,
    router: Router
  ) {
    super(mealService, alertService, authService, route, router);
    super.title = 'Maaltijd';
  }

  override onSubmit(meal: Meal) {
    // filter out uneditable properties
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { participants, createDate, updateDate, ...rest } = meal;
    super.onSubmit(rest as Meal);
  }
}
