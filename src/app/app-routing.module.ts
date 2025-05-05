import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ActivityRegisterComponent } from './pages/activity-register/activity-register.component';
import { ActivityRecordComponent } from './pages/activity-record/activity-record.component';
import { CoordinationRecordComponent } from './pages/coordination-record/coordination-record.component';
import { LoginGuard } from './guards/login.guard';
import { LoginComponent } from './pages/login/login.component';
import { CoordinationGuard } from './guards/coordination/coordination.guard';
import { AdminGuard } from './guards/admin/admin.guard';
import { InventoryEntriesComponent } from './pages/inventory/inventory-entries/inventory-entries.component';
import { InventoryExitsComponent } from './pages/inventory/inventory-exits/inventory-exits.component';
import { InventoryStockComponent } from './pages/inventory/inventory-stock/inventory-stock.component';
import { RegisterEntriesComponent } from './pages/inventory/inventory-entries/register-entries/register-entries.component';

const routes: Routes = [
  {path:"login",component: LoginComponent,canActivate: [LoginGuard], data:{expectedRol: [1,2,3] }},
  {path:"",component: LoginComponent,canActivate: [LoginGuard], data:{expectedRol: [1,2,3] }},
  
  //Activities
  {path:"activity/register/:userid",component: ActivityRegisterComponent},
  {path:"activity/record/:userid",component: ActivityRecordComponent},
  {path:"coordination/record/:userid",component: CoordinationRecordComponent},
  
  //Inventory
  {path:"inventory/register/entries/:userid",component: RegisterEntriesComponent},
  {path:"inventory/entries/:userid",component: InventoryEntriesComponent},
  {path:"inventory/exits/:userid",component: InventoryExitsComponent},
  {path:"inventory/stock/:userid",component: InventoryStockComponent},

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
