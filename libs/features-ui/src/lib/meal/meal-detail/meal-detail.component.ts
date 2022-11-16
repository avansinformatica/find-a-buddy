import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '@find-a-buddy/auth-ui';
import { BaseDetailComponent } from '@find-a-buddy/entity-ui';
import { Meal } from '../meal.model';
import { MealService } from '../meal.service';

@Component({
  selector: 'fab-feature-meal-detail',
  templateUrl: './meal-detail.component.html',
  styles: [],
})
export class MealDetailComponent extends BaseDetailComponent<Meal> {
  constructor(
    private mealService: MealService,
    public authService: AuthService,
    route: ActivatedRoute
  ) {
    super(mealService, route);
  }
}
