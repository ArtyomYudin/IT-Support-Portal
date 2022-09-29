import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AvayaComponent } from './avaya.component';

const routing = RouterModule.forChild([{ path: '', component: AvayaComponent }]);
@NgModule({
  declarations: [AvayaComponent],
  imports: [CommonModule, routing],
})
export class AvayaModule {}
