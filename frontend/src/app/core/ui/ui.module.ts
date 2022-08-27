import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ClarityModule } from '@clr/angular';

import { MainComponent } from '@core/ui/layout/main/main.component';
import { LayoutComponent } from '@core/ui/layout/layout.component';
import { HeaderComponent } from '@core/ui/layout/header/header.component';
import { GlobalPipeModule } from '@pipe/globalpipe.module';

@NgModule({
  declarations: [LayoutComponent, HeaderComponent, MainComponent],
  imports: [CommonModule, RouterModule, ClarityModule, GlobalPipeModule],
  exports: [LayoutComponent],
})
export class UiModule {}
