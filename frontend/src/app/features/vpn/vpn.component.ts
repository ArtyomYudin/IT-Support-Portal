import { Component, OnInit } from '@angular/core';
import { WebsocketService } from '@service/websocket.service';

@Component({
  selector: 'fe-vpn',
  templateUrl: './vpn.component.html',
  styleUrls: ['./vpn.component.scss'],
})
export class VpnComponent implements OnInit {
  constructor(private wsService: WebsocketService) {}

  ngOnInit(): void {
    this.wsService.send('getVpnActiveSession', null);
    this.wsService.send('getEmployee', null);
    this.wsService.send('getVpnCompletedSession', 720);
  }
}
