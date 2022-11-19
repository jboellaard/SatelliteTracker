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
import { UserComponent } from './pages/user/user.component';
import { UserDetailComponent } from './pages/user/detail/detail.component';
import { UserListComponent } from './pages/user/list/list.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NavbarComponent } from './shared/navbar/navbar.component';
import { AboutComponent } from './pages/about/about.component';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    SatelliteComponent,
    SatelliteDetailComponent,
    EditComponent,
    SatelliteListComponent,
    FooterComponent,
    UserComponent,
    UserDetailComponent,
    UserListComponent,
    NavbarComponent,
    AboutComponent,
  ],
  imports: [BrowserModule, AppRoutingModule, BrowserAnimationsModule, MatToolbarModule, MatIconModule, MatTableModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
