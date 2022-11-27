import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { UserListComponent } from './pages/user/list/list.component';
import { UserDetailComponent } from './pages/user/detail/detail.component';
import { UserEditComponent } from './pages/user/edit/edit.component';

import { AboutComponent } from './pages/about/about.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'users' },
  { path: 'about', pathMatch: 'full', component: AboutComponent },
  { path: 'users', pathMatch: 'full', component: UserListComponent },
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
