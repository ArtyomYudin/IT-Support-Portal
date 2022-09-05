import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ClarityModule } from '@clr/angular';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { GlobalPipeModule } from '@pipe/globalpipe.module';
import { UserRequestComponent } from './user-request.component';
import { RequestListComponent } from './request-list/request-list.component';
import { RequestNewComponent } from './request-new/request-new.component';

const routing = RouterModule.forChild([{ path: '', component: UserRequestComponent }]);
@NgModule({
  declarations: [UserRequestComponent, RequestListComponent, RequestNewComponent],
  imports: [CommonModule, ClarityModule, ReactiveFormsModule, MatAutocompleteModule, GlobalPipeModule, routing],
  providers: [DatePipe],
})
export class UserRequestModule {}
