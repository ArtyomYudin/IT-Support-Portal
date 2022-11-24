import { ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { FILE_PREVIEW_DATA } from '@service/file-preview/file.preview.token';

@Component({
  selector: 'fe-file-preview',
  standalone: true,
  templateUrl: './file-preview.component.html',
  styleUrls: ['./file-preview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgOptimizedImage],
})
export class FilePreviewComponent implements OnInit {
  constructor(@Inject(FILE_PREVIEW_DATA) public data: any) {}

  ngOnInit(): void {}
}
