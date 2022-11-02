import { BrowserModule } from '@angular/platform-browser';
import { NgModule, LOCALE_ID } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LayoutComponent } from './layout/layout.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { AboutComponent } from './pages/about/about.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AuthUIModule } from '@find-a-buddy/auth-ui';
import { ConfigModule, UtilUIModule } from '@find-a-buddy/util-ui';
import { RouterModule } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { NavbarComponent } from './shared/navbar/navbar.component';
import { FooterComponent } from './shared/footer/footer.component';
import { environment } from '../environments/environment';
import { registerLocaleData } from '@angular/common';
import localeNl from '@angular/common/locales/nl';
import { MealModule } from '@find-a-buddy/features-ui';

registerLocaleData(localeNl, 'nl');

@NgModule({
  declarations: [
    AppComponent,
    LayoutComponent,
    DashboardComponent,
    AboutComponent,
    LoginComponent,
    RegisterComponent,
    NavbarComponent,
    FooterComponent,
  ],
  imports: [
    BrowserModule,
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    ConfigModule.forRoot({ apiEndpoint: environment.SERVER_API_URL }),
    AuthUIModule,
    NgbModule,
    AppRoutingModule,
    UtilUIModule,
    MealModule,
  ],
  providers: [{ provide: LOCALE_ID, useValue: 'nl' }],
  bootstrap: [AppComponent],
})
export class AppModule {}
