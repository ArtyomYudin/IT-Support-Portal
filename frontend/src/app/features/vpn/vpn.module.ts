import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ClarityModule } from '@clr/angular';
import { VpnComponent } from './vpn.component';
import { ActiveSessionComponent } from './active-session/active-session.component';
import { UserActivityComponent } from './user-activity/user-activity.component';

const routes: Routes = [{ path: '', component: VpnComponent }];

@NgModule({
  declarations: [VpnComponent, ActiveSessionComponent, UserActivityComponent],
  imports: [CommonModule, ClarityModule, RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VpnModule {}
