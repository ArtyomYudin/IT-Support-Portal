import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'fe-purchase-list',
  templateUrl: './purchase-list.component.html',
  styleUrls: ['./purchase-list.component.scss'],
  // changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PurchaseListComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}
