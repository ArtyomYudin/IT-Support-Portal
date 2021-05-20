import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ClrWizard } from '@clr/angular';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Observable } from 'rxjs/internal/Observable';
import { filter, map, startWith } from 'rxjs/operators';
import { WebsocketService } from '../../../services/websocket.service';
import { Event } from '../../../services/websocket.service.event';

@Component({
  selector: 'fe-request-page',
  templateUrl: './request-page.component.html',
  styleUrls: ['./request-page.component.scss'],
  // changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RequestPageComponent implements OnInit {
  // public requestPageOpen: boolean;

  public requestInfo!: FormGroup;

  public requestAuthor!: FormGroup;

  public requestApprovers!: FormGroup;

  public expenseItemDescriptionStatus: boolean;

  public expenseItemDescriptionHelper: string;

  public options: string[] = ['One', 'Two', 'Three', 'test', 'test2', 'test3'];

  public filteredOptions: Observable<string[]>;

  public allEmployee$: Observable<any[]>;

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
    this.allEmployee$ = this.wsService.on<any>(Event.EV_ALL_EMPLOYEE);

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

    this.filteredOptions = this.requestInfo.controls.responsiblePerson.valueChanges.pipe(
      startWith(''),
      // map(value => (value.length >= 3 ? this.filter(value) : [])),
      map(value => this.filter(value)),
    );
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

  private filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    // console.log(this.allEmployee$.pipe(map(options => options.filter(option => option.toLowerCase().indexOf(filterValue) === 0))));
    // console.log(this.allEmployee$);
    // this.options = this.allEmployee$
    return this.options.filter(option => option.toLowerCase().indexOf(filterValue) === 0);
  }
}
