import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClarityModule } from '@clr/angular';
import { CdsModule } from '@cds/angular';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { RequestPageComponent } from './request-page/request-page.component';
import { RequestComponent } from './request.component';
import { RequestListComponent } from './request-list/request-list.component';

// import '@cds/core/input/register.js';
// import '@cds/core/textarea/register.js';

const routing = RouterModule.forChild([{ path: '', component: RequestComponent }]);
@NgModule({
  declarations: [RequestPageComponent, RequestComponent, RequestListComponent],
  imports: [CommonModule, ClarityModule, CdsModule, ReactiveFormsModule, routing],
})
export class RequestModule {}
