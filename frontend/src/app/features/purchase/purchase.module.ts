import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClarityModule } from '@clr/angular';

import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { PurchaseRequestPageComponent } from './purchase-request-page/purchase-request-page.component';
import { PurchaseComponent } from './purchase.component';
import { PurchaseRequestListComponent } from './purchase-request-list/purchase-request-list.component';

const routing = RouterModule.forChild([{ path: '', component: PurchaseComponent }]);
@NgModule({
  declarations: [PurchaseRequestPageComponent, PurchaseComponent, PurchaseRequestListComponent],
  imports: [CommonModule, ClarityModule, ReactiveFormsModule, MatAutocompleteModule, routing],
})
export class PurchaseModule {}
