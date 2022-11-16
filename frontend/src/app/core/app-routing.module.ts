import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

import { AuthGuard } from '@service/auth.guard.service';

const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  {
    path: 'home',
    loadChildren: () => import('../features/home/home.module').then(m => m.HomeModule),
    canActivate: [AuthGuard],
    // data: { key: 'cached_home' },
  },
  {
    path: 'user-request',
    loadChildren: () => import('../features/user-request/user-request.module').then(m => m.UserRequestModule),
    canActivate: [AuthGuard],
    // data: { key: 'cached_user_request' },
    data: { reuseRoute: true },
  },
  {
    path: 'purchase',
    // loadChildren: () => import('../features/purchase/purchase.module').then(m => m.PurchaseModule),
    canActivate: [AuthGuard],
    // data: { key: 'cached_purchase' },
    data: { reuseRoute: true },
  },
  {
    path: 'pacs',
    loadChildren: () => import('../features/pacs/pacs.module').then(m => m.PacsModule),
    canActivate: [AuthGuard],
    // data: { key: 'cached_pacs' },
    data: { reuseRoute: true },
  },
  {
    path: 'avaya',
    loadChildren: () => import('../features/avaya/avaya.module').then(m => m.AvayaModule),
    canActivate: [AuthGuard],
    // data: { key: 'cached_avaya' },
    data: { reuseRoute: true },
  },
  {
    path: 'dhcp',
    loadChildren: () => import('../features/dhcp/dhcp.module').then(m => m.DhcpModule),
    canActivate: [AuthGuard],
    // data: { key: 'cached_dhcp' },
    data: { reuseRoute: true },
  },
  {
    path: 'vpn',
    loadChildren: () => import('../features/vpn/vpn.module').then(m => m.VpnModule),
    canActivate: [AuthGuard],
    // data: { key: 'cached_vpn' },
    data: { reuseRoute: true },
  },
  {
    path: 'setting',
    loadChildren: () => import('../features/setting/setting.module').then(m => m.SettingModule),
    canActivate: [AuthGuard],
    // data: { key: 'cached_setting' },
    data: { reuseRoute: true },
  },
  { path: 'login', loadChildren: () => import('../features/login-page/login-page.module').then(m => m.LoginPageModule) },
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules, relativeLinkResolution: 'legacy' })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
