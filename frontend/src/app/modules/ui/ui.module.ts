import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { ClarityModule } from '@clr/angular';
import { ClarityIcons, dashboardIcon } from '@cds/core/icon';
import '@cds/core/icon/register.js';

import { MainComponent } from './layout/main/main.component';
import { LayoutComponent } from './layout/layout.component';
import { HeaderComponent } from './layout/header/header.component';

ClarityIcons.addIcons(dashboardIcon);
@NgModule({
  declarations: [LayoutComponent, HeaderComponent, MainComponent],
  imports: [CommonModule, RouterModule, ClarityModule],
  exports: [LayoutComponent],
})
export class UiModule {}
