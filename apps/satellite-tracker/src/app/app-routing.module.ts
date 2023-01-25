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

const routes: Routes = [
    { path: 'home', pathMatch: 'full', canActivate: [AuthGuard], component: DashboardComponent },
    { path: 'about', pathMatch: 'full', component: AboutComponent },
    { path: 'login', pathMatch: 'full', component: LoginComponent },
    { path: 'register', pathMatch: 'full', component: RegisterComponent },
    { path: 'profile', pathMatch: 'full', canActivate: [OwnerAuthGuard], component: ProfileComponent },
    { path: 'users', pathMatch: 'full', canActivate: [AdminAuthGuard], component: UserListComponent },
    {
        path: 'users/new',
        pathMatch: 'full',
        canActivate: [AdminAuthGuard],
        component: UserEditComponent,
    },
    {
        path: 'users/:username',
        pathMatch: 'full',
        component: UserDetailComponent,
    },
    {
        path: 'users/:username/edit',
        pathMatch: 'full',
        canActivate: [AdminAuthGuard],
        component: UserEditComponent,
    },
    {
        path: 'users/:username/satellites',
        pathMatch: 'full',
        component: SatelliteListComponent,
    },
    {
        path: 'users/:username/satellites/new',
        pathMatch: 'full',
        canActivate: [OwnerAuthGuard],
        component: SatelliteEditComponent,
    },
    {
        path: 'users/:username/satellites/:satelliteId/edit',
        pathMatch: 'full',
        canActivate: [OwnerAuthGuard],
        component: SatelliteEditComponent,
    },
    {
        path: 'users/:username/satellites/:satelliteId/orbit',
        pathMatch: 'full',
        canActivate: [OwnerAuthGuard],
        component: OrbitEditComponent,
    },
    { path: 'users/:username/satellites/:satelliteId', pathMatch: 'full', component: SatelliteDetailComponent },
    // {
    //   path: 'columns',
    //   component: ColumnsComponent,
    //   children: [
    //     { path: 'new', pathMatch: 'full', component: EditComponent },
    //     { path: ':id', pathMatch: 'full', component: DetailComponent },
    //     { path: ':id/edit', pathMatch: 'full', component: EditComponent },
    //   ],
    // },
    { path: '', pathMatch: 'full', redirectTo: 'home' },
    { path: '**', component: PageNotFoundComponent },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
})
export class AppRoutingModule {}
