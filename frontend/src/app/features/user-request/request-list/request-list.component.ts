import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Subject } from 'rxjs/internal/Subject';
import { distinctUntilChanged, takeUntil, tap } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { WebsocketService } from '@service/websocket.service';
import { Event } from '@service/websocket.service.event';
import { IUserRequest } from '@model/user-request.model';
import { Observable } from 'rxjs';
import { ClrCommonStringsService } from '@clr/angular';
import { russionLocale } from '@translation/russion';
import { RequestNewComponent } from '@feature/user-request/request-new/request-new.component';
import { RequestCardComponent } from '@feature/user-request/request-card/request-card.component';

@Component({
  selector: 'fe-user-request-list',
  templateUrl: './request-list.component.html',
  styleUrls: ['./request-list.component.scss'],
})
export class RequestListComponent implements OnInit, OnDestroy {
  public selected: any = [];

  public loading = true;

  public currentDate: Date = new Date();

  public userRequestArray$: Observable<IUserRequest>;

  public snackBarEvent$: Observable<any>;

  private ngUnsubscribe$: Subject<any> = new Subject();

  @ViewChild(RequestNewComponent) modalNew: RequestNewComponent;

  @ViewChild(RequestCardComponent) modalCard: RequestCardComponent;

  constructor(private wsService: WebsocketService, private commonStrings: ClrCommonStringsService, private notifyBar: MatSnackBar) {
    commonStrings.localize(russionLocale);
    this.userRequestArray$ = this.wsService.on<IUserRequest>(Event.EV_USER_REQUEST_ALL).pipe(
      distinctUntilChanged(),
      takeUntil(this.ngUnsubscribe$),
      tap(() => {
        this.loading = false;
      }),
    );
    this.wsService
      .on<any>(Event.EV_NOTIFY)
      .pipe(distinctUntilChanged(), takeUntil(this.ngUnsubscribe$))
      .subscribe(e => this.openNotifyBar(e));
  }

  private openNotifyBar(e: any) {
    this.notifyBar.open(e.event, '', {
      duration: 5000,
      verticalPosition: 'top',
    });
  }

  ngOnInit(): void {
    this.wsService.send('getAllUserRequest', null);
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe$.next(null);
    this.ngUnsubscribe$.complete();
  }

  public changeStatusIcon(id: number) {
    switch (id) {
      case 2:
        return 'clock';
        break;
      case 3:
        return 'success-standard';
        break;
      default:
        return 'new';
        break;
    }
  }

  public deleteRequestCard(cards: any) {
    const cardArray: any[] = [];
    cards.forEach((card: any) => {
      cardArray.push(card.requestNumber);
    });
    this.wsService.send('deleteUserRequest', cardArray);
  }
}
