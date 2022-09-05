import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs/internal/Subject';
import { distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { WebsocketService } from '@service/websocket.service';
import { Event } from '@service/websocket.service.event';
import { IUserRequest } from '@model/user-request.model';
import { Observable } from 'rxjs';
import { ClrCommonStringsService } from '@clr/angular';
import { russionLocale } from '@translation/russion';

@Component({
  selector: 'fe-user-request-list',
  templateUrl: './request-list.component.html',
  styleUrls: ['./request-list.component.scss'],
})
export class RequestListComponent implements OnInit, OnDestroy {
  public selected: any = [];

  public userRequestArray: Observable<IUserRequest>;

  private ngUnsubscribe$: Subject<any> = new Subject();

  constructor(private wsService: WebsocketService, private commonStrings: ClrCommonStringsService) {
    commonStrings.localize(russionLocale);
    this.userRequestArray = this.wsService
      .on<IUserRequest>(Event.EV_USER_REQUEST_ALL)
      .pipe(distinctUntilChanged(), takeUntil(this.ngUnsubscribe$));
  }

  ngOnInit(): void {
    this.wsService.send('getAllUserRequest');
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe$.next(null);
    this.ngUnsubscribe$.complete();
  }
}
