import { Component, OnInit } from '@angular/core';
import { distinctUntilChanged, takeUntil, tap } from 'rxjs/operators';
import { Subject } from 'rxjs/internal/Subject';
import { WebsocketService } from '@service/websocket.service';
import { Event } from '@service/websocket.service.event';
import { PurchaseRequest } from '@model/purchase-request.model';

@Component({
  selector: 'fe-purchase-request-list',
  templateUrl: './purchase-request-list.component.html',
  styleUrls: ['./purchase-request-list.component.scss'],
})
export class PurchaseRequestListComponent implements OnInit {
  public purchaseRequestArray$: PurchaseRequest | any;

  private ngUnsubscribe$: Subject<any> = new Subject();

  constructor(private wsService: WebsocketService) {
    this.purchaseRequestArray$ = this.wsService.on<PurchaseRequest>(Event.EV_PURCASE_REQUEST_ALL).pipe(
      distinctUntilChanged(),
      takeUntil(this.ngUnsubscribe$),
      tap(() => {
        // this.loading = false;
      }),
    );
  }

  ngOnInit(): void {}
}
