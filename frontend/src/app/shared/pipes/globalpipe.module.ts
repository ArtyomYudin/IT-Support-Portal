import { NgModule } from '@angular/core';
import { ThumbnailPhotoPipe } from './thumbnailphoto.pipe';
import { PurchaseTargetPipe } from './purchasetarget.pipe';
import { EmployeeNamePipe } from './employeename.pipe';

@NgModule({
  imports: [
    // dep modules
  ],
  declarations: [ThumbnailPhotoPipe, PurchaseTargetPipe, EmployeeNamePipe],
  exports: [ThumbnailPhotoPipe, PurchaseTargetPipe, EmployeeNamePipe],
})
export class GlobalPipeModule {}
