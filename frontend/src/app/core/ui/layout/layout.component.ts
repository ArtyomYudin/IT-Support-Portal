import { Component, OnInit, OnDestroy } from '@angular/core';
import { takeUntil, share, distinctUntilChanged } from 'rxjs/operators';
import { Subject } from 'rxjs/internal/Subject';
import { WebsocketService } from '@service/websocket.service';

@Component({
  selector: 'fe-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
})
export class LayoutComponent implements OnInit, OnDestroy {
  public isConnected: boolean;

  private ngUnsubscribe$: Subject<any> = new Subject();

  constructor(private wsService: WebsocketService) {
    this.wsService.status.pipe(share(), distinctUntilChanged(), takeUntil(this.ngUnsubscribe$)).subscribe(isConnected => {
      this.isConnected = isConnected;
    });
  }

  ngOnInit(): void {}

  public ngOnDestroy() {
    this.ngUnsubscribe$.next(null);
    this.ngUnsubscribe$.complete();
  }
}
