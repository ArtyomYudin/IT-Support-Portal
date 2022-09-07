import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs/internal/Subject';
import { distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { WebsocketService } from '@service/websocket.service';
import { Event } from '@service/websocket.service.event';
import { IUserRequest } from '@model/user-request.model';
import { Observable } from 'rxjs';
import { ClrCommonStringsService } from '@clr/angular';
import { russionLocale } from '@translation/russion';
import { Buffer } from 'buffer';

@Component({
  selector: 'fe-user-request-list',
  templateUrl: './request-list.component.html',
  styleUrls: ['./request-list.component.scss'],
})
export class RequestListComponent implements OnInit, OnDestroy {
  public selected: any = [];

  public attachmentArray$: any;

  public userRequestArray: Observable<IUserRequest>;

  private ngUnsubscribe$: Subject<any> = new Subject();

  constructor(private wsService: WebsocketService, private commonStrings: ClrCommonStringsService) {
    commonStrings.localize(russionLocale);
    this.userRequestArray = this.wsService
      .on<IUserRequest>(Event.EV_USER_REQUEST_ALL)
      .pipe(distinctUntilChanged(), takeUntil(this.ngUnsubscribe$));

    this.attachmentArray$ = this.wsService
      .on<any>(Event.EV_USER_REQUEST_ATTACHMENT)
      .pipe(distinctUntilChanged(), takeUntil(this.ngUnsubscribe$));
  }

  ngOnInit(): void {
    this.wsService.send('getAllUserRequest');
    this.wsService.send('getUserRequestAttachment', '000001');
    // this.attachmentArray$.subscribe((attach: any) => {
    // console.log(attach[6].attachment);
    // console.log(Buffer.from(attach[6].attachment).toString('base64'));
    // });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe$.next(null);
    this.ngUnsubscribe$.complete();
  }
}
