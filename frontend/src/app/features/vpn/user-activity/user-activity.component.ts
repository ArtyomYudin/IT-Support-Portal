import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { WebsocketService } from '@service/websocket.service';
import { Subject } from 'rxjs/internal/Subject';
import { Observable } from 'rxjs/internal/Observable';
import { distinctUntilChanged, takeUntil, tap } from 'rxjs/operators';
import { IEmployee } from '@model/employee.model';
import { IVpnSession } from '@model/vpn-session.model';
import { Event } from '@service/websocket.service.event';

@Component({
  selector: 'fe-vpn-user-activity',
  templateUrl: './user-activity.component.html',
  styleUrls: ['./user-activity.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserActivityComponent implements OnInit, OnDestroy {
  public loadingEmployee = true;

  public loadingSession = true;

  public employeeListArray$: Observable<IEmployee>;

  public sessionListArray$: Observable<IVpnSession>;

  private ngUnsubscribe$: Subject<any> = new Subject();

  private reloadVpnSession: NodeJS.Timer;

  constructor(private wsService: WebsocketService) {
    this.employeeListArray$ = this.wsService.on<IEmployee>(Event.EV_EMPLOYEE).pipe(
      distinctUntilChanged(),
      takeUntil(this.ngUnsubscribe$),
      tap(() => {
        this.loadingEmployee = false;
      }),
    );
    this.sessionListArray$ = this.wsService.on<IVpnSession>(Event.EV_VPN_COMPLETED_SESSION).pipe(
      distinctUntilChanged(),
      takeUntil(this.ngUnsubscribe$),
      tap(() => {
        this.loadingSession = false;
      }),
    );
  }

  ngOnInit(): void {
    this.wsService.send('getEmployee', null);
    this.wsService.send('getVpnCompletedSession', 720);
    /*
    this.reloadVpnSession = setInterval(() => {
      this.loadingSession = true;
      this.wsService.send('getVpnCompletedSession', 720);
    }, 120000);
    */
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe$.next(null);
    this.ngUnsubscribe$.complete();
    clearInterval(this.reloadVpnSession);
  }

  public onDetailOpen(user: string): void {}

  public sessionRefresh() {
    this.loadingSession = true;
    this.wsService.send('getVpnCompletedSession', 720);
  }
}
