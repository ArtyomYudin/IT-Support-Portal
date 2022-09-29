import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DhcpComponent } from './dhcp.component';

const routing = RouterModule.forChild([{ path: '', component: DhcpComponent }]);
@NgModule({
  declarations: [DhcpComponent],
  imports: [CommonModule, routing],
})
export class DhcpModule {}
