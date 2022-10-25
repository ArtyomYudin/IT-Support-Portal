import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { WebsocketService } from '@service/websocket.service';
import { Subject } from 'rxjs/internal/Subject';
import { IEmployee } from '@model/employee.model';
import { Event } from '@service/websocket.service.event';
import { Observable } from 'rxjs/internal/Observable';
import { distinctUntilChanged, takeUntil, tap } from 'rxjs/operators';

@Component({
  selector: 'fe-vpn-user-activity',
  templateUrl: './user-activity.component.html',
  styleUrls: ['./user-activity.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserActivityComponent implements OnInit, OnDestroy {
  public loading = true;

  public employeeListArray$: Observable<IEmployee>;
  // public eventVpnActiveSessionArray$: Observable<IVpnActiveSession>;

  private ngUnsubscribe$: Subject<any> = new Subject();

  constructor(private wsService: WebsocketService) {
    this.employeeListArray$ = this.wsService.on<IEmployee>(Event.EV_EMPLOYEE).pipe(
      distinctUntilChanged(),
      takeUntil(this.ngUnsubscribe$),
      tap(() => {
        this.loading = false;
      }),
    );
  }

  ngOnInit(): void {
    this.wsService.send('getEmployee', null);
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe$.next(null);
    this.ngUnsubscribe$.complete();
  }
}
