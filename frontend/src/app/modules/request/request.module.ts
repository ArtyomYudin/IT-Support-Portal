import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RequestPageComponent } from './request-page/request-page.component';
import { RequestListComponent } from './request-list/request-list.component';

@NgModule({
  declarations: [RequestPageComponent, RequestListComponent],
  imports: [CommonModule],
})
export class RequestModule {}
