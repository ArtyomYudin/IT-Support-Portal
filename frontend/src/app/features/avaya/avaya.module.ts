import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClarityModule } from '@clr/angular';
import { RouterModule, Routes } from '@angular/router';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { AvayaComponent } from './avaya.component';
import { AvayaCDRComponent } from './avaya-cdr/avaya-cdr.component';
import { AvayaCDRFilterComponent } from './avaya-cdr-filter/avaya-cdr-filter.component';

// const routing = RouterModule.forChild([{ path: 'avaya', component: AvayaComponent }]);
const routes: Routes = [{ path: '', component: AvayaComponent }];

@NgModule({
  declarations: [AvayaComponent, AvayaCDRComponent, AvayaCDRFilterComponent],
  imports: [CommonModule, ClarityModule, MatAutocompleteModule, RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AvayaModule {}
