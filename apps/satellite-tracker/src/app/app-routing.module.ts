import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { UserListComponent } from './pages/user/user-list/user-list.component';
import { UserDetailComponent } from './pages/user/user-detail/user-detail.component';
import { UserEditComponent } from './pages/user/user-edit/user-edit.component';
import { SatelliteDetailComponent } from './pages/satellite/satellite-detail/satellite-detail.component';
import { SatelliteEditComponent } from './pages/satellite/satellite-edit/satellite-edit.component';

import { AboutComponent } from './pages/about/about.component';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { OrbitEditComponent } from './pages/satellite/orbit-edit/orbit-edit.component';
import { SatelliteListComponent } from './pages/satellite/satellite-list/satellite-list.component';
import { AuthGuard } from './auth/auth.guard';
import { AdminAuthGuard } from './auth/admin-auth.guard';
import { OwnerAuthGuard } from './auth/owner-auth.guard';
import { PageNotFoundComponent } from './shared/page-not-found/page-not-found.component';
import { ProfileComponent } from './profile/profile.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { SatelliteComponent } from './pages/satellite/satellite.component';
import { DiscoverComponent } from './pages/dashboard/discover/discover.component';
import { FeedComponent } from './pages/dashboard/feed/feed.component';
import { FollowingComponent } from './pages/dashboard/feed/following/following.component';
import { TrackingComponent } from './pages/dashboard/feed/tracking/tracking.component';
import { ForYouComponent } from './pages/dashboard/discover/for-you/for-you.component';
import { PopularComponent } from './pages/dashboard/discover/popular/popular.component';

const routes: Routes = [
    { path: 'home', pathMatch: 'full', redirectTo: 'feed' },
    {
        path: 'discover',
        canActivate: [AuthGuard],
        component: DiscoverComponent,
        children: [
            { path: '', redirectTo: 'for-you', pathMatch: 'full' },
            { path: 'for-you', pathMatch: 'full', component: ForYouComponent },
            { path: 'popular', pathMatch: 'full', component: PopularComponent },
        ],
    },
    {
        path: 'feed',
        canActivate: [AuthGuard],
        component: FeedComponent,
        children: [
            { path: '', redirectTo: 'following', pathMatch: 'full' },
            { path: 'following', pathMatch: 'full', component: FollowingComponent },
            { path: 'tracked-satellites', pathMatch: 'full', component: TrackingComponent },
        ],
    },
    { path: 'about', pathMatch: 'full', component: AboutComponent },
    { path: 'login', pathMatch: 'full', component: LoginComponent },
    { path: 'register', pathMatch: 'full', component: RegisterComponent },
    { path: 'user-overview', pathMatch: 'full', canActivate: [AdminAuthGuard], component: UserListComponent },
    {
        path: 'user-overview/:username',
        pathMatch: 'full',
        canActivate: [AdminAuthGuard],
        component: UserDetailComponent,
    },
    { path: 'user-overview/new', pathMatch: 'full', canActivate: [AdminAuthGuard], component: UserEditComponent },
    {
        path: 'user-overview/:username/edit',
        pathMatch: 'full',
        canActivate: [AdminAuthGuard],
        component: UserEditComponent,
    },
    // {
    //     path: ':username/profile',
    //     pathMatch: 'full',
    //     component: ProfileComponent,
    // },
    {
        path: ':username/profile/edit',
        pathMatch: 'full',
        canActivate: [OwnerAuthGuard],
        component: ProfileComponent,
    },
    {
        path: ':username/satellites/new',
        pathMatch: 'full',
        canActivate: [OwnerAuthGuard],
        component: SatelliteEditComponent,
    },
    {
        path: ':username/satellites/:satelliteId',
        pathMatch: 'full',
        component: SatelliteDetailComponent,
    },
    {
        path: ':username/satellites/:satelliteId/edit',
        pathMatch: 'full',
        canActivate: [OwnerAuthGuard],
        component: SatelliteEditComponent,
    },
    {
        path: ':username/satellites/:satelliteId/orbit',
        pathMatch: 'full',
        canActivate: [OwnerAuthGuard],
        component: OrbitEditComponent,
    },
    {
        path: ':username',
        component: ProfileComponent,
    },
    { path: '', pathMatch: 'full', redirectTo: 'feed' },
    { path: '**', component: PageNotFoundComponent },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
})
export class AppRoutingModule {}
