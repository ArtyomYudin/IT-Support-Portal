import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs/internal/Subject';
import { Observable } from 'rxjs/internal/Observable';
import { distinctUntilChanged, takeUntil, tap } from 'rxjs/operators';
import { WebsocketService } from '@service/websocket.service';
import { IAvayaCDR } from '@model/avaya-cdr.model';
import { Event } from '@service/websocket.service.event';

@Component({
  selector: 'fe-avaya-cdr',
  templateUrl: './avaya-cdr.component.html',
  styleUrls: ['./avaya-cdr.component.scss'],
})
export class AvayaCDRComponent implements OnInit, OnDestroy {
  public loading = true;

  public eventAvayaCDRArray$: Observable<IAvayaCDR>;

  private ngUnsubscribe$: Subject<any> = new Subject();

  constructor(private wsService: WebsocketService) {
    this.eventAvayaCDRArray$ = this.wsService.on<IAvayaCDR>(Event.EV_AVAYA_CDR).pipe(
      distinctUntilChanged(),
      takeUntil(this.ngUnsubscribe$),
      tap(() => {
        this.loading = false;
      }),
    );
  }

  ngOnInit(): void {
    this.wsService.send('getAvayaCDR', null);
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe$.next(null);
    this.ngUnsubscribe$.complete();
  }
}
