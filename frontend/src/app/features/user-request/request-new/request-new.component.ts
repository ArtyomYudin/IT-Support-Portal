import { Component, OnInit, OnDestroy } from '@angular/core';
import { Validators, FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { Subject } from 'rxjs/internal/Subject';
import { debounceTime, distinctUntilChanged, filter, switchMap, takeUntil, tap, first } from 'rxjs/operators';
import { WebsocketService } from '@service/websocket.service';
import { Event } from '@service/websocket.service.event';
import { Department } from '@model/department.model';
import { RequestService } from '@model/request-service.model';
import { RequestStatus } from '@model/request-status.model';
import { RequestPriority } from '@model/request-priority.model';
import { Employee } from '@model/employee.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'fe-user-request-new',
  templateUrl: './request-new.component.html',
  styleUrls: ['./request-new.component.scss'],
})
export class RequestNewComponent implements OnInit, OnDestroy {
  public modalOpen: boolean;

  public files: any;

  public userRequest: FormGroup;

  public filteredInitiator: Employee | any;

  public serviceListArray: Observable<any>;

  public department: Observable<any>;

  public currentDate: Date = new Date();

  public statusListArray: Observable<any>;

  public priorityListArray: Observable<any>;

  public executorListArray: Observable<any>;

  public userRequestAllData: {
    requestNumber?: string;
    initiatorId?: number;
    departmentId?: number;
    executorId?: number;
    serviceId?: number;
    topic?: string;
    description?: string;
    statusId?: number;
    priorityId?: number;
    deadline?: string;
  } = {};

  private ngUnsubscribe$: Subject<any> = new Subject();

  constructor(private formBuilder: FormBuilder, private wsService: WebsocketService, private datePipe: DatePipe) {
    this.serviceListArray = this.wsService
      .on<RequestService>(Event.EV_USER_REQUEST_SERVICE)
      .pipe(distinctUntilChanged(), takeUntil(this.ngUnsubscribe$));

    this.statusListArray = this.wsService
      .on<RequestStatus>(Event.EV_USER_REQUEST_STATUS)
      .pipe(distinctUntilChanged(), takeUntil(this.ngUnsubscribe$));

    this.priorityListArray = this.wsService
      .on<RequestPriority>(Event.EV_USER_REQUEST_PRIORITY)
      .pipe(distinctUntilChanged(), takeUntil(this.ngUnsubscribe$));

    this.executorListArray = this.wsService
      .on<any>(Event.EV_EMPLOYEE_BY_PARENT_DEPARTMENT)
      .pipe(distinctUntilChanged(), takeUntil(this.ngUnsubscribe$));

    this.department = this.wsService.on<Department>(Event.EV_DEPARTMENT).pipe(distinctUntilChanged(), takeUntil(this.ngUnsubscribe$));
  }

  ngOnInit(): void {
    this.userRequest = this.formBuilder.group({
      deadline: ['', Validators.required],
      status: ['', Validators.required],
      priority: ['', Validators.required],
      initiator: ['', Validators.required],
      initiatorDepartment: [{ value: '', disabled: true }, Validators.required],
      executor: ['', Validators.required],
      service: ['', Validators.required],
      topic: ['', Validators.required],
      description: ['', Validators.required],
    });

    this.userRequest.controls.initiator.valueChanges
      .pipe(
        distinctUntilChanged(),
        debounceTime(500),
        tap(() => {
          this.filteredInitiator = null;
        }),
        filter(value => value.length >= 3),
        switchMap(value => {
          this.wsService.send('getFilteredRequestInitiator', value);
          return this.wsService.on<Employee>(Event.EV_FILTERED_EMPLOYEE);
        }),
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe(data => {
        if (!data) {
          this.filteredInitiator = null;
        } else {
          this.filteredInitiator = data;
        }
      });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe$.next(null);
    this.ngUnsubscribe$.complete();
  }

  public resetRequestPage(): void {
    Object.keys(this.userRequest.controls).forEach(key => {
      this.userRequest.get(key).reset('');
    });
  }

  public onOpen(): void {
    this.modalOpen = true;
    this.wsService.send('getUserRequestStatus', null);
    this.wsService.send('getUserRequestPriority', null);
    this.wsService.send('getUserRequestService', null);
    this.wsService.send('getEmployeeByParentDepartment', 39);
    this.statusListArray.subscribe(statuses => {
      this.userRequest.controls.status.setValue(statuses[0].name);
      this.userRequestAllData.statusId = statuses[0].id;
    });
    this.priorityListArray.subscribe(priorities => {
      this.userRequest.controls.priority.setValue(priorities[0].name);
      this.userRequestAllData.priorityId = priorities[0].id;
    });
    this.userRequest.controls.deadline.setValue(this.currentDate.toLocaleDateString());
    // this.userRequestAllData.deadline = this.currentDate.toLocaleDateString();
    this.userRequestAllData.requestNumber = '000001';
  }

  public onChange(event: any): void {
    console.log(event.target.files);
  }

  public onClose(): void {
    this.modalOpen = false;
    // console.log(this.requestInfo.controls.test.value);
    this.resetRequestPage();
  }

  public onStatusSelected(status: any): void {
    this.userRequestAllData.statusId = status.id;
  }

  public onPrioritySelected(priority: any): void {
    this.userRequestAllData.priorityId = priority.id;
  }

  public onInitiatorSelected(initiator: any): void {
    this.wsService.send('getDepartment', initiator.departmentId);
    this.department.subscribe(dep => this.userRequest.controls.initiatorDepartment.setValue(dep[0].name));
    this.userRequestAllData.initiatorId = initiator.id;
    this.userRequestAllData.departmentId = initiator.departmentId;
  }

  public onExecutorSelected(executor: any): void {
    this.userRequestAllData.executorId = executor.id;
  }

  public onServiceSelected(service: any): void {
    this.userRequestAllData.serviceId = service.id;
  }

  public onSave(): void {
    this.modalOpen = false;
    this.userRequestAllData.deadline = this.datePipe.transform(this.userRequest.controls.deadline.value, 'yyyy-dd-MM');
    this.userRequestAllData.topic = this.userRequest.controls.topic.value;
    this.userRequestAllData.description = this.userRequest.controls.description.value;
    this.wsService.send('saveNewUserRequest', this.userRequestAllData);
    console.log(this.userRequestAllData);
    this.resetRequestPage();
  }
}
