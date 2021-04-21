import { NgModule } from '@angular/core';
import { ThumbnailPhotoPipe } from './thumbnailphoto.pipe';
// import { DatetimeformatPipe } from '@pipe/datetimeformat.pipe';

@NgModule({
  imports: [
    // dep modules
  ],
  declarations: [ThumbnailPhotoPipe],
  exports: [ThumbnailPhotoPipe],
})
export class GlobalPipeModule {}
