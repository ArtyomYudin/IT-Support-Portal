import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs/internal/Subject';
import { distinctUntilChanged, first, takeUntil } from 'rxjs/operators';
import { Observable } from 'rxjs/internal/Observable';
import { FormBuilder, FormGroup } from '@angular/forms';
import { WebsocketService } from '@service/websocket.service';
import { Event } from '@service/websocket.service.event';
import { Notify } from '@model/notify.model';
import { IUserRequest } from '@model/user-request.model';
import { JwtHelperService } from '@auth0/angular-jwt';
import { OverlayModule } from '@angular/cdk/overlay';

@Component({
  selector: 'fe-user-request-card',
  templateUrl: './request-card.component.html',
  styleUrls: ['./request-card.component.scss'],
})
export class RequestCardComponent implements OnInit, OnDestroy {
  public userRequest: any;

  public modalOpen: boolean;

  public attachmentArray$: any;

  public attachmentBase64$: any;

  // public userRequestCardModel: any;

  private ngUnsubscribe$: Subject<any> = new Subject();

  public userRequest$: Observable<any>;

  public userRequestLifeCycle$: Observable<any>;

  public delegateListArray$: Observable<any>;

  public requestStatus: any;

  public userRequestCard: FormGroup;

  public listOfFiles: any[] = [];

  public images: string;

  public userRequestNewData: {
    delegate?: number;
    serviceId?: number;
    attachments?: any[];
    comment?: string;
  } = {};

  public token = JSON.parse(localStorage.getItem('IT-Support-Portal'));

  constructor(private wsService: WebsocketService, private formBuilder: FormBuilder, private jwtHelper: JwtHelperService) {
    this.userRequest$ = this.wsService
      .on<IUserRequest>(Event.EV_USER_REQUEST_BY_NUMBER)
      .pipe(distinctUntilChanged(), takeUntil(this.ngUnsubscribe$));
    this.delegateListArray$ = this.wsService
      .on<any>(Event.EV_EMPLOYEE_BY_PARENT_DEPARTMENT)
      .pipe(distinctUntilChanged(), takeUntil(this.ngUnsubscribe$));
    this.attachmentArray$ = this.wsService
      .on<any>(Event.EV_USER_REQUEST_ATTACHMENT)
      .pipe(distinctUntilChanged(), takeUntil(this.ngUnsubscribe$));
    this.userRequestLifeCycle$ = this.wsService
      .on<any>(Event.EV_USER_REQUEST_LIFE_CYCLE)
      .pipe(distinctUntilChanged(), takeUntil(this.ngUnsubscribe$));
    this.attachmentBase64$ = this.wsService
      .on<any>(Event.EV_USER_REQUEST_ATTACHMENT_BASE64)
      .pipe(distinctUntilChanged(), takeUntil(this.ngUnsubscribe$));
  }

  ngOnInit(): void {
    this.userRequestCard = this.formBuilder.group({
      comment: [''],
      delegate: [''],
    });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe$.next(null);
    this.ngUnsubscribe$.complete();
  }

  public onOpen(requestNumber: any): void {
    console.log(requestNumber);
    this.wsService.send('getUserRequestByNumber', requestNumber);
    this.wsService.send('getUserRequestLifeCycle', requestNumber);
    this.wsService.send('getEmployeeByParentDepartment', 49);
    this.wsService.send('getUserRequestAttachment', { requestNumber });
    this.userRequest$.subscribe(request => {
      // eslint-disable-next-line prefer-destructuring
      this.userRequest = request;
    });
    this.attachmentArray$.subscribe((attach: any) => {
      this.listOfFiles = attach;
    });
    this.modalOpen = true;
    // this.userRequest = card;
    // console.log(this.userRequest.requestNumber);
  }

  public onClose(): void {
    this.modalOpen = false;
    this.attachmentArray$.unsubscribe();
    this.userRequestCard.reset();
  }

  public takeRequestToWork() {
    this.wsService.send('updateUserRequest', {
      requestNumber: this.userRequest.requestNumber,
      employeeId: this.token.id,
      newData: { status: 2 },
    });
    this.wsService
      .on<Notify>(Event.EV_NOTIFY)
      .pipe(first(), takeUntil(this.ngUnsubscribe$))
      .subscribe(status => {
        this.requestStatus = status;
      });
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

  public onSave() {
    this.modalOpen = false;
    this.userRequestNewData.comment = this.userRequestCard.controls.comment.value;
    this.wsService.send('updateUserRequest', {
      requestNumber: this.userRequest.requestNumber,
      employeeId: this.token.id,
      newData: this.userRequestNewData,
    });
    this.userRequestCard.reset();
  }

  public viewAttachment(file: any) {
    this.wsService.send('getUserRequestAttachment', {
      requestNumber: this.userRequest.requestNumber,
      fileName: file.fileName,
      filePath: file.filePath,
    });
    this.attachmentBase64$.subscribe((attach: any) => {
      this.images = attach;
    });
    console.log(file);
  }
}
