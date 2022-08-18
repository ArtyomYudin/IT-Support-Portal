import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

import { AuthGuard } from '@service/auth.guard.service';

const routes: Routes = [
  { path: '', redirectTo: '/purchase', pathMatch: 'full' },
  {
    path: 'purchase',
    loadChildren: () => import('../features/purchase/purchase.module').then(m => m.PurchaseModule),
    canActivate: [AuthGuard],
    data: { key: 'cached_purchase' },
  },
  { path: 'login', loadChildren: () => import('../features/login-page/login-page.module').then(m => m.LoginPageModule) },
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules, relativeLinkResolution: 'legacy' })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
