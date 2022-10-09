import { NgModule } from '@angular/core';
import { ThumbnailPhotoPipe } from './thumbnailphoto.pipe';
import { PurchaseTargetPipe } from './purchasetarget.pipe';
import { EmployeeNamePipe } from './employeename.pipe';
import { AvayaDurationConvertPipe } from './avayadurationconvert.pipe';
import { AvayaCallCodeConvertPipe } from './avayacallcodeconvert.pipe';

@NgModule({
  imports: [
    // dep modules
  ],
  declarations: [ThumbnailPhotoPipe, PurchaseTargetPipe, EmployeeNamePipe, AvayaDurationConvertPipe, AvayaCallCodeConvertPipe],
  exports: [ThumbnailPhotoPipe, PurchaseTargetPipe, EmployeeNamePipe, AvayaDurationConvertPipe, AvayaCallCodeConvertPipe],
})
export class GlobalPipeModule {}
