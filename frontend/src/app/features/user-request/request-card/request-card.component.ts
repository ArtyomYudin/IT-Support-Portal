import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs/internal/Subject';
import { first, takeUntil } from 'rxjs/operators';
import { WebsocketService } from '@service/websocket.service';
import { Event } from '@service/websocket.service.event';

@Component({
  selector: 'fe-user-request-card',
  templateUrl: './request-card.component.html',
  styleUrls: ['./request-card.component.scss'],
})
export class RequestCardComponent implements OnInit, OnDestroy {
  public userRequest: any;

  public modalOpen: boolean;

  public attachmentArray$: any;

  private ngUnsubscribe$: Subject<any> = new Subject();

  public listOfFiles: any[] = [];

  constructor(private wsService: WebsocketService) {
    this.attachmentArray$ = this.wsService.on<any>(Event.EV_USER_REQUEST_ATTACHMENT).pipe(first(), takeUntil(this.ngUnsubscribe$));
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.ngUnsubscribe$.next(null);
    this.ngUnsubscribe$.complete();
  }

  public onOpen(card: any): void {
    this.modalOpen = true;
    this.userRequest = card;
    console.log(this.userRequest.requestNumber);
    this.wsService.send('getUserRequestAttachment', this.userRequest.requestNumber);
    this.attachmentArray$.subscribe((attach: any) => {
      this.listOfFiles = attach;
      // console.log(Buffer.from(attach[6].attachment).toString('base64'));
    });
  }

  public onClose(): void {
    this.modalOpen = false;
    // this.attachmentArray$.unsubscribe();
    // console.log(this.requestInfo.controls.test.value);
  }

  public takeRequestToWork() {
    this.wsService.send('takeRequestToWork', 2);
  }
}
