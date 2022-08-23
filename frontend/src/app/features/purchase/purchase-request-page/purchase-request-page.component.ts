import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { ClrWizard } from '@clr/angular';
import { JwtHelperService } from '@auth0/angular-jwt';
import { debounceTime, distinctUntilChanged, filter, switchMap, takeUntil, tap, first } from 'rxjs/operators';
import { Subject } from 'rxjs/internal/Subject';
import { WebsocketService } from '@service/websocket.service';
import { Event } from '@service/websocket.service.event';
import { AuthenticationService } from '@service/auth.service';
import { Employee } from '@model/employee.model';
import { AuthUser } from '@model/auth-user.model';

@Component({
  selector: 'fe-purchase-request-page',
  templateUrl: './purchase-request-page.component.html',
  styleUrls: ['./purchase-request-page.component.scss'],
})
export class PurchaseRequestPageComponent implements OnInit, OnDestroy {
  public currentUser: AuthUser;

  public requestInfo: FormGroup;

  public requestAuthor: FormGroup;

  public requestApprovers: FormGroup;

  public expenseDepartmentDescriptionStatus: boolean;

  public expenseDepartmentDescriptionHelper: string;

  public expenseProjectDescriptionStatus: boolean;

  public expenseProjectDescriptionHelper: string;

  public filteredRespPerson: any[] = [];

  public purchaseRequestAllData: any;

  public isLoading = false;

  public eventEmployeeByEmail$: Employee | any;

  private ngUnsubscribe$: Subject<any> = new Subject();

  private responsiblePerson: any;

  @ViewChild('purchaseRequestWizard') wizard: ClrWizard;

  constructor(
    private formBuilder: FormBuilder,
    private wsService: WebsocketService,
    private jwtHelper: JwtHelperService,
    private authenticationService: AuthenticationService,
  ) {
    this.authenticationService.currentUser$.pipe(takeUntil(this.ngUnsubscribe$)).subscribe(x => {
      this.currentUser = x;
    });
  }

  ngOnInit(): void {
    this.requestInfo = this.formBuilder.group({
      purchaseInitiator: ['', Validators.required],
      purchaseTarget: ['', Validators.required],
      responsiblePerson: ['', Validators.required],
      expenseItemCompany: ['', Validators.required],
      expenseItemDepartment: ['', Validators.required],
      expenseItemProject: ['', Validators.required],
      expenseDepartmentDescription: [''],
      expenseProjectDescription: [''],
      purchaseReason: ['', Validators.required],
      purchaseITDepartment: ['', Validators.required],
      purchaseLogisticDepartment: ['', Validators.required],
      requestAuthor: ['', Validators.required],
    });
    /*
    this.requestAuthor = this.formBuilder.group({
      requestAuthorName: ['', Validators.required],
      requestAuthorPosition: ['', Validators.required],
    });
 */
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
    this.wsService
      .on<Employee>(Event.EV_EMPLOYEE_BY_EMAIL)
      .pipe(first(), takeUntil(this.ngUnsubscribe$))
      .subscribe(value => {
        this.requestInfo.controls.purchaseInitiator.setValue(value.departmentName);
        this.requestInfo.controls.purchaseInitiator.disable();
        this.requestInfo.controls.requestAuthor.setValue(`${value.positionName}  ${value.displayName}`);
        this.requestInfo.controls.requestAuthor.disable();
        this.wizard.open();
      });
  }

  public onCancel(): void {
    this.saveAsDraft();

    Object.keys(this.requestInfo.controls).forEach(key => {
      this.requestInfo.get(key).setValue('');
      this.requestInfo.get(key).setErrors(null);
    });
    // this.requestInfo.reset(); // ошибка в логах при закрытии окна визарда !!!
    this.requestApprovers.reset();
    this.wizard.reset();
  }

  public onSubmit(): void {
    this.wizard.reset();
  }

  /**
   * изменение видимости полей  Checkbox-ов
   */
  public onCheckboxChange(event: any, expenseItem: string): void {
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
        this.expenseDepartmentDescriptionStatus = event.target.checked;
        this.expenseDepartmentDescriptionHelper = 'Укажите наименование подразделения.';
        if (event.target.checked) {
          this.requestInfo.controls.expenseDepartmentDescription.setValidators(Validators.required);
          this.requestInfo.controls.expenseItemCompany.disable();
          this.requestInfo.controls.expenseItemProject.disable();
        } else {
          this.requestInfo.controls.expenseDepartmentDescription.clearValidators();
          this.requestInfo.controls.expenseItemCompany.enable();
          this.requestInfo.controls.expenseItemProject.enable();
        }
        this.requestInfo.controls.expenseDepartmentDescription.updateValueAndValidity();
        break;
      }
      case 'project': {
        this.expenseProjectDescriptionStatus = event.target.checked;
        this.expenseProjectDescriptionHelper = 'Укажите наименование проекта.';

        if (event.target.checked) {
          this.requestInfo.controls.expenseProjectDescription.setValidators(Validators.required);
          this.requestInfo.controls.expenseItemCompany.disable();
          this.requestInfo.controls.expenseItemDepartment.disable();
        } else {
          this.requestInfo.controls.expenseProjectDescription.clearValidators();
          this.requestInfo.controls.expenseItemCompany.enable();
          this.requestInfo.controls.expenseItemDepartment.enable();
        }
        this.requestInfo.controls.expenseProjectDescription.updateValueAndValidity();
        break;
      }
      /**
       * Слатает валидация purchaseLogisticDepartment и purchaseITDepartment
       * дает возможность продолжить без выбора подразделения закупки !!!!
       * Необходимо разобраться или переделать
       */
      case 'it': {
        if (event.target.checked) {
          this.requestInfo.controls.purchaseLogisticDepartment.disable();
        } else {
          this.requestInfo.controls.purchaseLogisticDepartment.enable();
        }
        break;
      }
      case 'logistic': {
        if (event.target.checked) {
          this.requestInfo.controls.purchaseITDepartment.disable();
        } else {
          this.requestInfo.controls.purchaseITDepartment.enable();
        }
        break;
      }

      default: {
        break;
      }
    }
  }

  // eslint-disable-next-line class-methods-use-this
  public displayFn(respPerson: any) {
    return respPerson || null;
  }

  public setResponsiblePerson(person: any): void {
    this.responsiblePerson = person;
  }

  public saveAsDraft(): void {
    this.purchaseRequestAllData = {
      purchaseAuthorIdId: this.currentUser.id,
      purchaseTarget: this.requestInfo.controls.purchaseTarget.value,
      responsiblePersonId: this.responsiblePerson ? this.responsiblePerson.id : 0,
      purchaseReason: this.requestInfo.controls.purchaseReason.value,
      // requestAuthorName: this.requestAuthor.controls.requestAuthorName.value,
      // requestAuthorPosition: this.requestAuthor.controls.requestAuthorPosition.value,
    };
    this.wsService.send('purchaseRequestAsDraft', this.purchaseRequestAllData);
  }
}
