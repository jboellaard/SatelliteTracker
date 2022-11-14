import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { SatelliteComponent } from './pages/satellite/satellite.component';
import { SatelliteDetailComponent } from './pages/satellite/detail/detail.component';
import { EditComponent } from './pages/satellite/edit/edit.component';
import { SatelliteListComponent } from './pages/satellite/list/list.component';
import { FooterComponent } from './shared/footer/footer.component';
import { NavComponent } from './shared/nav/nav.component';
import { UserComponent } from './pages/user/user.component';
import { UserDetailComponent } from './pages/user/detail/detail.component';
import { UserListComponent } from './pages/user/list/list.component';

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    SatelliteComponent,
    SatelliteDetailComponent,
    EditComponent,
    SatelliteListComponent,
    FooterComponent,
    NavComponent,
    UserComponent,
    UserDetailComponent,
    UserListComponent,
  ],
  imports: [BrowserModule, AppRoutingModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
