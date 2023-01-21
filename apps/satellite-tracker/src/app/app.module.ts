import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { SatelliteComponent } from './pages/satellite/satellite.component';
import { SatelliteDetailComponent } from './pages/satellite/satellite-detail/satellite-detail.component';
import { SatelliteEditComponent } from './pages/satellite/satellite-edit/satellite-edit.component';
import { SatelliteListComponent } from './pages/satellite/satellite-list/satellite-list.component';
import { FooterComponent } from './shared/footer/footer.component';
import { UserComponent } from './pages/user/user.component';
import { UserDetailComponent } from './pages/user/user-detail/user-detail.component';
import { UserEditComponent } from './pages/user/user-edit/user-edit.component';
import { UserListComponent } from './pages/user/user-list/user-list.component';
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
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSliderModule } from '@angular/material/slider';
import { MatCheckboxModule } from '@angular/material/checkbox';

import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';

import { AuthService } from './auth/auth.service';
import { httpInterceptorProviders } from './auth/auth.interceptor';

@NgModule({
    declarations: [
        AppComponent,
        DashboardComponent,
        SatelliteComponent,
        SatelliteDetailComponent,
        SatelliteEditComponent,
        SatelliteListComponent,
        FooterComponent,
        UserComponent,
        UserDetailComponent,
        UserEditComponent,
        NavbarComponent,
        AboutComponent,
        UserListComponent,
        LoginComponent,
        RegisterComponent,
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
        MatSidenavModule,
        MatSliderModule,
        MatCheckboxModule,
    ],
    providers: [AuthService, httpInterceptorProviders],
    bootstrap: [AppComponent],
})
export class AppModule {}
