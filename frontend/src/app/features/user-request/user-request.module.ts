import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClarityModule } from '@clr/angular';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { UserRequestComponent } from './user-request.component';
import { RequestListComponent } from './request-list/request-list.component';
import { RequestPageComponent } from './request-page/request-page.component';

const routing = RouterModule.forChild([{ path: '', component: UserRequestComponent }]);
@NgModule({
  declarations: [UserRequestComponent, RequestListComponent, RequestPageComponent],
  imports: [CommonModule, ClarityModule, ReactiveFormsModule, routing],
})
export class UserRequestModule {}
