import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ClrWizard } from '@clr/angular';
import { Subject } from 'rxjs/internal/Subject';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'fe-request-page',
  templateUrl: './request-page.component.html',
  styleUrls: ['./request-page.component.scss'],
})
export class RequestPageComponent implements OnInit {
  // public requestPageOpen: boolean;

  public requestInfo!: FormGroup;

  public requestAuthor!: FormGroup;

  public requestApprovers!: FormGroup;

  public expenseItemDescriptionStatus: boolean;

  public expenseItemDescriptionHelper: string;

  private ngUnsubscribe$: Subject<any> = new Subject();

  private expenseItemProperties(expenseItem: string, expenseItemValue: boolean): void {
    switch (expenseItem) {
      case 'company': {
        break;
      }
      case 'department': {
        this.expenseItemDescriptionStatus = expenseItemValue;
        this.expenseItemDescriptionHelper = 'Укажите наименование подразделения.';
        break;
      }
      case 'project': {
        this.expenseItemDescriptionStatus = expenseItemValue;
        this.expenseItemDescriptionHelper = 'Укажите наименование проекта.';
        /*
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
        */
        break;
      }
      default: {
        break;
      }
    }
  }

  @ViewChild('requestWizard') wizard: ClrWizard;

  constructor(private formBuilder: FormBuilder) {}

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

    this.requestInfo.controls.expenseItemCompany.valueChanges
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe(value => this.expenseItemProperties('company', value));
    this.requestInfo.controls.expenseItemDepartment.valueChanges
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe(value => this.expenseItemProperties('department', value));
    this.requestInfo.controls.expenseItemProject.valueChanges
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe(value => this.expenseItemProperties('project', value));
  }

  public ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }

  // convenience getter for easy access to form fields
  get f(): any {
    return this.requestInfo.controls;
  }

  public open(): void {
    // this.requestPageOpen = true;
    this.wizard.open();
  }

  public onCancel(): void {
    this.requestInfo.reset();
    this.wizard.reset();
  }

  public onSubmit(): void {
    this.wizard.reset();
  }
}
