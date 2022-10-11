import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'fe-dhcp',
  templateUrl: './dhcp.component.html',
  styleUrls: ['./dhcp.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DhcpComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}
