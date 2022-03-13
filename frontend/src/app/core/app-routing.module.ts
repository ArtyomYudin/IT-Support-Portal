import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

import { AuthGuard } from '@service/auth.guard.service';

const routes: Routes = [
  { path: '', redirectTo: '/request', pathMatch: 'full' },
  {
    path: 'request',
    loadChildren: () => import('../features/request/request.module').then(m => m.RequestModule),
    canActivate: [AuthGuard],
    data: { key: 'cached_request' },
  },
  { path: 'login', loadChildren: () => import('../features/login-page/login-page.module').then(m => m.LoginPageModule) },
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules, relativeLinkResolution: 'legacy' })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
