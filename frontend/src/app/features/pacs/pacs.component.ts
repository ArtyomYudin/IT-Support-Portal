import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'fe-pacs',
  standalone: true,
  imports: [],
  templateUrl: './pacs.component.html',
  styleUrls: ['./pacs.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PacsComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}
