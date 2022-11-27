import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

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
import { UserEditComponent } from './pages/user/edit/edit.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NavbarComponent } from './shared/navbar/navbar.component';
import { AboutComponent } from './pages/about/about.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatListModule } from '@angular/material/list';
import { RandomuserComponent } from './pages/randomuser/randomuser.component';
import { RandomUserListComponent } from './pages/randomuser/list/list.component';
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
    UserComponent,
    UserDetailComponent,
    UserEditComponent,
    NavbarComponent,
    AboutComponent,
    RandomuserComponent,
    RandomUserListComponent,
    UserListComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    MatToolbarModule,
    MatIconModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatGridListModule,
    MatListModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
