import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClarityModule } from '@clr/angular';

import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { PurchasePageComponent } from './purchase-page/purchase-page.component';
import { PurchaseComponent } from './purchase.component';
import { PurchaseListComponent } from './purchase-list/purchase-list.component';

const routing = RouterModule.forChild([{ path: '', component: PurchaseComponent }]);
@NgModule({
  declarations: [PurchasePageComponent, PurchaseComponent, PurchaseListComponent],
  imports: [CommonModule, ClarityModule, ReactiveFormsModule, MatAutocompleteModule, routing],
})
export class PurchaseModule {}
