import { Component, Inject, OnInit } from '@angular/core';
import { FILE_PREVIEW_DATA } from '@service/file-preview/file.preview.token';

@Component({
  selector: 'fe-file-preview',
  templateUrl: './file-preview.component.html',
  styleUrls: ['./file-preview.component.scss'],
})
export class FilePreviewComponent implements OnInit {
  constructor(@Inject(FILE_PREVIEW_DATA) public data: any) {}

  ngOnInit(): void {}
}
