import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClarityModule } from '@clr/angular';
import { CdsModule } from '@cds/angular';
// import { loadCoreIconSet } from '@cds/core/icon/collections/core';
// import { loadEssentialIconSet } from '@cds/core/icon/collections/essential';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
// eslint-disable-next-line import/no-extraneous-dependencies
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { RequestPageComponent } from './request-page/request-page.component';
import { RequestComponent } from './request.component';
import { RequestListComponent } from './request-list/request-list.component';

// import '@cds/core/input/register.js';
// import '@cds/core/textarea/register.js';
// loadEssentialIconSet();
const routing = RouterModule.forChild([{ path: '', component: RequestComponent }]);
@NgModule({
  declarations: [RequestPageComponent, RequestComponent, RequestListComponent],
  imports: [CommonModule, ClarityModule, CdsModule, ReactiveFormsModule, MatAutocompleteModule, routing],
})
export class RequestModule {}
