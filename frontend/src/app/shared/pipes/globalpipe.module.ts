import { NgModule } from '@angular/core';
import { ThumbnailPhotoPipe } from './thumbnailphoto.pipe';
import { PurchaseTargetPipe } from './purchasetarget.pipe';

@NgModule({
  imports: [
    // dep modules
  ],
  declarations: [ThumbnailPhotoPipe, PurchaseTargetPipe],
  exports: [ThumbnailPhotoPipe, PurchaseTargetPipe],
})
export class GlobalPipeModule {}
