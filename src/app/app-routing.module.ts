import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ActivityRegisterComponent } from './pages/activity-register/activity-register.component';
import { ActivityRecordComponent } from './pages/activity-record/activity-record.component';
import { CoordinationRecordComponent } from './pages/coordination-record/coordination-record.component';
import { LoginGuard } from './guards/login.guard';
import { LoginComponent } from './pages/login/login.component';
import { CoordinationGuard } from './guards/coordination/coordination.guard';
import { AdminGuard } from './guards/admin/admin.guard';
const routes: Routes = [
  {path:"login",component: LoginComponent,canActivate: [LoginGuard], data:{expectedRol: [1,2,3] }},
  {path:"",component: LoginComponent,canActivate: [LoginGuard], data:{expectedRol: [1,2,3] }},
  {path:"activity/register/:userid",component: ActivityRegisterComponent},
  {path:"activity/record/:userid",component: ActivityRecordComponent},
  {path:"coordination/record/:userid",component: CoordinationRecordComponent},

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
