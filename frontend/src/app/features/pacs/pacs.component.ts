import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'fe-pacs',
  templateUrl: './pacs.component.html',
  styleUrls: ['./pacs.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PacsComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}
