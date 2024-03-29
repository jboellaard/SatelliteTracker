import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { NavbarComponent } from './shared/navbar/navbar.component';
import { BreadcrumbsComponent } from './shared/breadcrumbs/breadcrumbs.component';
import { SidebarComponent } from './shared/sidebar/sidebar.component';
import { FooterComponent } from './shared/footer/footer.component';
import { PageNotFoundComponent } from './shared/page-not-found/page-not-found.component';
import { AboutComponent } from './pages/about/about.component';

import { AuthService } from './auth/auth.service';
import { httpInterceptorProviders } from './auth/auth.interceptor';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { UserListComponent } from './pages/user/user-list/user-list.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { TabCreatedComponent } from './pages/profile/tabs/tab-created/tab-created.component';
import { TabFollowingComponent } from './pages/profile/tabs/tab-following/tab-following.component';
import { TabFollowersComponent } from './pages/profile/tabs/tab-followers/tab-followers.component';
import { TabTrackingComponent } from './pages/profile/tabs/tab-tracking/tab-tracking.component';
import { EditProfileComponent } from './pages/profile/edit-profile/edit-profile.component';

import { FeedComponent } from './pages/dashboard/feed/feed.component';
import { FollowingComponent } from './pages/dashboard/feed/following/following.component';
import { TrackingComponent } from './pages/dashboard/feed/tracking/tracking.component';
import { DiscoverComponent } from './pages/dashboard/discover/discover.component';
import { ForYouComponent } from './pages/dashboard/discover/for-you/for-you.component';
import { PopularComponent } from './pages/dashboard/discover/popular/popular.component';
import { RecentComponent } from './pages/dashboard/discover/recent/recent.component';

import { DeleteDialogComponent } from './utils/delete-dialog/delete-dialog.component';
import { AddEditDialogComponent } from './utils/add-edit-dialog/add-edit-dialog.component';

import { SatelliteEditComponent } from './pages/satellite/satellite-edit/satellite-edit.component';
import { AddPurposeDialogComponent } from './pages/satellite/satellite-edit/add-purpose-dialog/add-purpose-dialog.component';
import { AddPartDialogComponent } from './pages/satellite/satellite-edit/add-part-dialog/add-part-dialog.component';
import { OrbitEditComponent } from './pages/satellite/orbit-edit/orbit-edit.component';
import { SatelliteDetailComponent } from './pages/satellite/satellite-detail/satellite-detail.component';
import { SatelliteTrackersComponent } from './pages/satellite/satellite-detail/satellite-trackers/satellite-trackers.component';
import { SatelliteInfoComponent } from './pages/satellite/satellite-detail/satellite-info/satellite-info.component';

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
import { MatSelectModule } from '@angular/material/select';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { OrbitSimulationComponent } from './pages/satellite/orbit-simulation/orbit-simulation.component';

const materialModules = [
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
    MatSelectModule,
    MatExpansionModule,
    MatDialogModule,
    MatTooltipModule,
    MatMenuModule,
    MatSnackBarModule,
    MatBadgeModule,
    MatTabsModule,
    MatProgressBarModule,
    MatDatepickerModule,
    MatNativeDateModule,
];

@NgModule({
    declarations: [
        AppComponent,
        SatelliteDetailComponent,
        SatelliteEditComponent,
        FooterComponent,
        NavbarComponent,
        AboutComponent,
        UserListComponent,
        LoginComponent,
        RegisterComponent,
        AddPurposeDialogComponent,
        OrbitEditComponent,
        PageNotFoundComponent,
        ProfileComponent,
        SidebarComponent,
        FeedComponent,
        DiscoverComponent,
        DeleteDialogComponent,
        AddEditDialogComponent,
        FollowingComponent,
        TrackingComponent,
        ForYouComponent,
        PopularComponent,
        TabCreatedComponent,
        TabFollowingComponent,
        TabFollowersComponent,
        TabTrackingComponent,
        AddPartDialogComponent,
        RecentComponent,
        BreadcrumbsComponent,
        EditProfileComponent,
        SatelliteTrackersComponent,
        SatelliteInfoComponent,
        OrbitSimulationComponent,
    ],
    imports: [
        BrowserModule,
        HttpClientModule,
        BrowserAnimationsModule,
        FormsModule,
        ReactiveFormsModule,
        ...materialModules,
        DragDropModule,
        AppRoutingModule,
    ],
    providers: [AuthService, httpInterceptorProviders, MatDatepickerModule],
    bootstrap: [AppComponent],
})
export class AppModule {}
