import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'fe-dhcp',
  standalone: true,
  templateUrl: './dhcp.component.html',
  styleUrls: ['./dhcp.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class DhcpComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}
