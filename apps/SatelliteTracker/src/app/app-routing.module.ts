import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SatelliteDetailComponent } from './pages/satellite/detail/detail.component';
import { SatelliteListComponent } from './pages/satellite/list/list.component';
// import { SatelliteEditComponent } from './pages/satellite/edit/edit.component';
import { UserComponent } from './pages/user/user.component';
import { UserDetailComponent } from './pages/user/detail/detail.component';
import { UserListComponent } from './pages/user/list/list.component';
import { UserEditComponent } from './pages/user/edit/edit.component';

import { AboutComponent } from './pages/about/about.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'users' },
  { path: 'about', pathMatch: 'full', component: AboutComponent },
  { path: 'users', pathMatch: 'full', component: UserComponent },
  {
    path: 'user-list',
    pathMatch: 'full',
    component: UserListComponent,
  },
  {
    path: 'users/new',
    pathMatch: 'full',
    component: UserEditComponent,
  },
  {
    path: 'users/:id',
    pathMatch: 'full',
    component: UserDetailComponent,
  },
  {
    path: 'users/:id/edit',
    pathMatch: 'full',
    component: UserEditComponent,
  },
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
