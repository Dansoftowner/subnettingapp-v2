import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FormComponent } from './components/form/form.component';
import { ResultsComponent } from './components/results/results.component';
import { SettingsComponent } from './components/settings/settings.component';
import { LoginComponent } from './components/login/login.component';
import { RegistrationComponent } from './components/registration/registration.component';
import { authGuard } from './guards/auth.guard';
import { unauthGuard } from './guards/unauth.guard';
import { PasswordRestorationComponent } from './components/password-restoration/password-restoration.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';

const routes: Routes = [
  { path: 'form', component: FormComponent, canActivate: [authGuard] },
  { path: 'login', component: LoginComponent, canActivate: [unauthGuard] },
  {
    path: 'register',
    component: RegistrationComponent,
    canActivate: [unauthGuard],
  },
  { path: 'results', component: ResultsComponent, canActivate: [authGuard] },
  { path: 'settings', component: SettingsComponent },

  { path: 'forgotten-password', component: PasswordRestorationComponent },
  {
    path: 'forgotten-password/:userId/:passwordtoken',
    component: PasswordRestorationComponent,
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard],
  },
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: '/dashboard' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
