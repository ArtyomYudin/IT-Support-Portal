import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ClarityModule } from '@clr/angular';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { GlobalPipeModule } from '@pipe/globalpipe.module';
import { UserRequestComponent } from './user-request.component';
import { RequestListComponent } from './request-list/request-list.component';
import { RequestNewComponent } from './request-new/request-new.component';
import { RequestCardComponent } from './request-card/request-card.component';

const routing = RouterModule.forChild([{ path: '', component: UserRequestComponent }]);
@NgModule({
  declarations: [UserRequestComponent, RequestListComponent, RequestNewComponent, RequestCardComponent],
  imports: [CommonModule, ClarityModule, ReactiveFormsModule, MatAutocompleteModule, MatSnackBarModule, GlobalPipeModule, routing],
  providers: [DatePipe],
})
export class UserRequestModule {}