import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { ClrWizard } from '@clr/angular';
import { JwtHelperService } from '@auth0/angular-jwt';
import { debounceTime, distinctUntilChanged, filter, switchMap, takeUntil, tap } from 'rxjs/operators';
import { Subject } from 'rxjs/internal/Subject';
import { WebsocketService } from '@service/websocket.service';
import { Event } from '@service/websocket.service.event';
import { Observable } from 'rxjs/internal/Observable';
import { Employee } from '@model/employee.model';

@Component({
  selector: 'fe-purchase-page',
  templateUrl: './purchase-page.component.html',
  styleUrls: ['./purchase-page.component.scss'],
})
export class PurchasePageComponent implements OnInit, OnDestroy {
  public requestInfo!: UntypedFormGroup;

  public requestAuthor!: UntypedFormGroup;

  public requestApprovers!: UntypedFormGroup;

  public expenseItemDescriptionStatus: boolean;

  public expenseItemDescriptionHelper: string;

  public filteredRespPerson: any[] = [];

  public isLoading = false;

  public eventEmployeeByEmail$: any | Observable<Employee>;

  private ngUnsubscribe$: Subject<any> = new Subject();

  currentUser: any;

  private expenseItemProperties(expenseItem: string, expenseItemValue: any): void {
    switch (expenseItem) {
      case 'company': {
        console.log(expenseItemValue.target.checked);
        if (expenseItemValue) {
          this.requestInfo.controls.expenseItemDepartment.disable();
          this.requestInfo.controls.expenseItemProject.disable();
        } else {
          this.requestInfo.controls.expenseItemDepartment.enable();
          this.requestInfo.controls.expenseItemProject.enable();
        }
        break;
      }
      case 'department': {
        console.log('DEP!');
        this.expenseItemDescriptionStatus = expenseItemValue;
        this.expenseItemDescriptionHelper = 'Укажите наименование подразделения.';
        if (expenseItemValue) {
          this.requestInfo.controls.expenseItemDescription.setValidators(Validators.required);
          this.requestInfo.controls.expenseItemCompany.disable();
          this.requestInfo.controls.expenseItemProject.disable();
        } else {
          this.requestInfo.controls.expenseItemDescription.clearValidators();
          this.requestInfo.controls.expenseItemCompany.enable();
          this.requestInfo.controls.expenseItemProject.enable();
        }
        this.requestInfo.controls.expenseItemDescription.updateValueAndValidity();
        break;
      }
      case 'project': {
        this.expenseItemDescriptionStatus = expenseItemValue;
        this.expenseItemDescriptionHelper = 'Укажите наименование проекта.';

        if (expenseItemValue) {
          this.requestInfo.controls.expenseItemDescription.setValidators(Validators.required);
          this.requestInfo.controls.expenseItemCompany.disable();
          this.requestInfo.controls.expenseItemDepartment.disable();
        } else {
          this.requestInfo.controls.expenseItemDescription.clearValidators();
          this.requestInfo.controls.expenseItemCompany.enable();
          this.requestInfo.controls.expenseItemDepartment.enable();
        }
        this.requestInfo.controls.expenseItemDescription.updateValueAndValidity();
        break;
      }

      default: {
        break;
      }
    }
  }

  @ViewChild('requestWizard') wizard: ClrWizard;

  constructor(private formBuilder: UntypedFormBuilder, private wsService: WebsocketService, private jwtHelper: JwtHelperService) {}

  ngOnInit(): void {
    this.eventEmployeeByEmail$ = this.wsService.on<Employee>(Event.EV_EMPLOYEE_BY_EMAIL);
    this.requestInfo = this.formBuilder.group({
      purchaseInitiator: ['', Validators.required],
      purchaseTarget: ['', Validators.required],
      responsiblePerson: ['', Validators.required],
      expenseItemCompany: [''],
      expenseItemDepartment: [''],
      expenseItemProject: [''],
      expenseItemDescription: [''],
      purchaseReason: ['', Validators.required],
      purchaseDepartment: ['', Validators.required],
    });

    this.requestAuthor = this.formBuilder.group({
      requestAuthorName: ['', Validators.required],
      requestAuthorPosition: ['', Validators.required],
    });
    this.requestApprovers = this.formBuilder.group({
      headOfInitDepartment: ['', Validators.required],
      headOfPurchaseDepartment: ['', Validators.required],
      deputyDirector: [''],
      headOfFinDepartment: ['', Validators.required],
    });

    this.requestInfo.controls.responsiblePerson.valueChanges
      .pipe(
        distinctUntilChanged(),
        debounceTime(500),
        tap(() => {
          this.filteredRespPerson = [];
          // this.isLoading = true;
        }),
        filter(value => value.length >= 3),
        switchMap(value => {
          this.wsService.send('getFilteredRespPerson', value);
          return this.wsService.on<any>(Event.EV_FILTERED_EMPLOYEE);
        }),
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe(data => {
        // console.log(data.length);
        if (!data) {
          this.filteredRespPerson = [];
          // this.isLoading = true;
        } else {
          this.filteredRespPerson = data;
          // this.isLoading = false;
        }
      });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe$.next(null);
    this.ngUnsubscribe$.complete();
  }

  /*
  // convenience getter for easy access to form fields
  get f(): any {
    return this.requestInfo.controls;
  }
 */

  public open(): void {
    const { token } = JSON.parse(localStorage.getItem('IT-Support-Portal'));
    this.wsService.send('purchaseRequestInit', this.jwtHelper.decodeToken(token).email);
    this.wizard.open();
  }

  public onCancel(): void {
    this.requestInfo.reset(); // ошибка в логах при закрытии окна визарда !!!
    this.requestAuthor.reset();
    this.requestApprovers.reset();
    this.wizard.reset();
  }

  public onSubmit(): void {
    this.wizard.reset();
  }

  // изменение видимости полей Статья расходов
  public onCheckboxChange(event: any, expenseItem: string): void {
    // console.log(event.target.checked);
    switch (expenseItem) {
      case 'company': {
        if (event.target.checked) {
          this.requestInfo.controls.expenseItemDepartment.disable();
          this.requestInfo.controls.expenseItemProject.disable();
        } else {
          this.requestInfo.controls.expenseItemDepartment.enable();
          this.requestInfo.controls.expenseItemProject.enable();
        }
        break;
      }
      case 'department': {
        // console.log('DEP!');
        this.expenseItemDescriptionStatus = event.target.checked;
        this.expenseItemDescriptionHelper = 'Укажите наименование подразделения.';
        if (event.target.checked) {
          this.requestInfo.controls.expenseItemDescription.setValidators(Validators.required);
          this.requestInfo.controls.expenseItemCompany.disable();
          this.requestInfo.controls.expenseItemProject.disable();
        } else {
          this.requestInfo.controls.expenseItemDescription.clearValidators();
          this.requestInfo.controls.expenseItemCompany.enable();
          this.requestInfo.controls.expenseItemProject.enable();
        }
        this.requestInfo.controls.expenseItemDescription.updateValueAndValidity();
        break;
      }
      case 'project': {
        this.expenseItemDescriptionStatus = event.target.checked;
        this.expenseItemDescriptionHelper = 'Укажите наименование проекта.';

        if (event.target.checked) {
          this.requestInfo.controls.expenseItemDescription.setValidators(Validators.required);
          this.requestInfo.controls.expenseItemCompany.disable();
          this.requestInfo.controls.expenseItemDepartment.disable();
        } else {
          this.requestInfo.controls.expenseItemDescription.clearValidators();
          this.requestInfo.controls.expenseItemCompany.enable();
          this.requestInfo.controls.expenseItemDepartment.enable();
        }
        this.requestInfo.controls.expenseItemDescription.updateValueAndValidity();
        break;
      }

      default: {
        break;
      }
    }
  }

  // eslint-disable-next-line class-methods-use-this
  public displayFn(respPerson: any) {
    return respPerson ? respPerson.name : null;
  }
}
