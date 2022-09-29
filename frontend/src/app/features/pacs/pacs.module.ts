import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PacsComponent } from './pacs.component';

const routing = RouterModule.forChild([{ path: '', component: PacsComponent }]);
@NgModule({
  declarations: [PacsComponent],
  imports: [CommonModule, routing],
})
export class PacsModule {}
