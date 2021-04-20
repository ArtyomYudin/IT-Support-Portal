import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from './services/auth.guard.service';

const routes: Routes = [
  { path: '', redirectTo: '/request', pathMatch: 'full' },
  {
    path: 'request',
    loadChildren: () => import('./modules/request/request.module').then(m => m.RequestModule),
    canActivate: [AuthGuard],
    data: { key: 'cached_request' },
  },
  { path: 'login', loadChildren: () => import('./modules/login-page/login-page.module').then(m => m.LoginPageModule) },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
