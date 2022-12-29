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

const routes: Routes = [
    { path: '', pathMatch: 'full', redirectTo: 'users' },
    { path: 'about', pathMatch: 'full', component: AboutComponent },
    { path: 'login', pathMatch: 'full', component: LoginComponent },
    { path: 'register', pathMatch: 'full', component: RegisterComponent },
    { path: 'users', pathMatch: 'full', component: UserListComponent },
    {
        path: 'users/new',
        pathMatch: 'full',
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
        component: UserEditComponent,
    },
    {
        path: 'users/:username/satellites/new',
        pathMatch: 'full',
        component: SatelliteEditComponent,
    },
    {
        path: 'users/:username/satellites/:satelliteId/edit',
        pathMatch: 'full',
        component: SatelliteEditComponent,
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
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
})
export class AppRoutingModule {}
