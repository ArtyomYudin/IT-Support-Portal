import { NgModule } from '@angular/core';
import { ThumbnailPhotoPipe } from './thumbnailphoto.pipe';
import { PurchaseTargetPipe } from './purchasetarget.pipe';
import { EmployeeNamePipe } from './employeename.pipe';
import { RequestStatusIconPipe } from './request.status.icon.pipe';

@NgModule({
  imports: [
    // dep modules
  ],
  declarations: [ThumbnailPhotoPipe, PurchaseTargetPipe, EmployeeNamePipe, RequestStatusIconPipe],
  exports: [ThumbnailPhotoPipe, PurchaseTargetPipe, EmployeeNamePipe, RequestStatusIconPipe],
})
export class GlobalPipeModule {}
