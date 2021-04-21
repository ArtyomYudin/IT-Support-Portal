import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClarityModule } from '@clr/angular';
import { CdsModule } from '@cds/angular';
import { RouterModule } from '@angular/router';
import { RequestPageComponent } from './request-page/request-page.component';
import { RequestComponent } from './request.component';

import '@cds/core/input/register.js';

const routing = RouterModule.forChild([{ path: '', component: RequestComponent }]);
@NgModule({
  declarations: [RequestPageComponent, RequestComponent],
  imports: [CommonModule, ClarityModule, CdsModule, routing],
})
export class RequestModule {}
