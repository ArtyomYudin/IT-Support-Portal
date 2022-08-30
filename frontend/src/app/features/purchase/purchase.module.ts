import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClarityModule } from '@clr/angular';

import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { GlobalPipeModule } from '@pipe/globalpipe.module';
import { PurchaseComponent } from './purchase.component';
import { PurchaseRequestPageComponent } from './purchase-request-page/purchase-request-page.component';
import { PurchaseRequestListComponent } from './purchase-request-list/purchase-request-list.component';

const routing = RouterModule.forChild([{ path: '', component: PurchaseComponent }]);
@NgModule({
  declarations: [PurchaseComponent, PurchaseRequestPageComponent, PurchaseRequestListComponent],
  imports: [CommonModule, ClarityModule, ReactiveFormsModule, MatAutocompleteModule, GlobalPipeModule, routing],
})
export class PurchaseModule {}
