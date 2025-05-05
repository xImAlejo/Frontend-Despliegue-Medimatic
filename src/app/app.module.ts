import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HeaderAppComponent } from './pages/headers/header-app/header-app.component';
import { CoordinationRecordComponent } from './pages/coordination-record/coordination-record.component';
import { ActivityRecordComponent } from './pages/activity-record/activity-record.component';
import { ActivityRegisterComponent } from './pages/activity-register/activity-register.component';
import { MaterialModule } from './material-module';
import {FormsModule} from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { LoginComponent } from './pages/login/login.component';
import { HeaderLoginComponent } from './pages/headers/header-login/header-login.component';
import { AuthInterceptor } from 'src/interceptors/auth-interceptor';
import { HeaderActivityOthersComponent } from './pages/headers/header-activity-others/header-activity-others.component';
import { InventoryEntriesComponent } from './pages/inventory/inventory-entries/inventory-entries.component';
import { InventoryExitsComponent } from './pages/inventory/inventory-exits/inventory-exits.component';
import { InventoryStockComponent } from './pages/inventory/inventory-stock/inventory-stock.component';
import { RegisterEntriesComponent } from './pages/inventory/inventory-entries/register-entries/register-entries.component';
import { EditSerieDialogComponent } from './pages/inventory/inventory-dialogs/edit-serie-dialog/edit-serie-dialog.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderAppComponent,
    CoordinationRecordComponent,
    ActivityRecordComponent,
    ActivityRegisterComponent,
    LoginComponent,
    HeaderLoginComponent,
    HeaderActivityOthersComponent,
    InventoryEntriesComponent,
    InventoryExitsComponent,
    InventoryStockComponent,
    RegisterEntriesComponent,
    EditSerieDialogComponent

  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
