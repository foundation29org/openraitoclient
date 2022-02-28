import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthGuard } from 'app/shared/auth/auth-guard.service';
import { RoleGuard } from 'app/shared/auth/role-guard.service';

import { HomeComponent } from './home/home.component';
import { PatientComponent } from './patient/patient.component';

const routes: Routes = [
  {
    path: 'home',
    component: HomeComponent,
    data: {
      title: 'menu.Dashboard',
      expectedRole: ['Clinical']
    },
    canActivate: [AuthGuard, RoleGuard]
  },
  {
    path: 'patient',
    component: PatientComponent,
    data: {
      title: 'menu.Dashboard',
      expectedRole: ['Clinical']
    },
    canActivate: [AuthGuard, RoleGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UserRoutingModule { }
