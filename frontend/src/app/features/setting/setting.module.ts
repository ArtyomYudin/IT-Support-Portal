import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ClarityModule } from '@clr/angular';

import { EmployeeComponent } from './employee/employee.component';
import { SettingComponent } from './setting.component';

const routing = RouterModule.forChild([{ path: '', component: SettingComponent }]);
@NgModule({
  declarations: [EmployeeComponent, SettingComponent],
  imports: [CommonModule, ClarityModule, routing],
})
export class SettingModule {}
