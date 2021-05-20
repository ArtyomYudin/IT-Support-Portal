import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ClrWizard } from '@clr/angular';
import { Subject } from 'rxjs/internal/Subject';
import { JwtHelperService } from '@auth0/angular-jwt';
import { WebsocketService } from '../../../services/websocket.service';

@Component({
  selector: 'fe-request-page',
  templateUrl: './request-page.component.html',
  styleUrls: ['./request-page.component.scss'],
  // changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RequestPageComponent implements OnInit, OnDestroy {
  // public requestPageOpen: boolean;

  public requestInfo!: FormGroup;

  public requestAuthor!: FormGroup;

  public requestApprovers!: FormGroup;

  public expenseItemDescriptionStatus: boolean;

  public expenseItemDescriptionHelper: string;

  private ngUnsubscribe$: Subject<any> = new Subject();

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

  constructor(private formBuilder: FormBuilder, private wsService: WebsocketService, private jwtHelper: JwtHelperService) {}

  ngOnInit(): void {
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
  }

  public ngOnDestroy(): void {
    this.ngUnsubscribe$.next(null);
    this.ngUnsubscribe$.complete();
  }

  // convenience getter for easy access to form fields
  get f(): any {
    return this.requestInfo.controls;
  }

  public open(): void {
    const { token } = JSON.parse(localStorage.getItem('IT-Support-Portal'));
    this.wsService.send('requestInit', this.jwtHelper.decodeToken(token).email);
    this.wizard.open();
  }

  public onCancel(): void {
    this.requestInfo.reset();
    this.wizard.reset();
  }

  public onSubmit(): void {
    this.wizard.reset();
  }

  public onCheckboxChange(event: any, expenseItem: string): void {
    console.log(event.target.checked);
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
        console.log('DEP!');
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
}
