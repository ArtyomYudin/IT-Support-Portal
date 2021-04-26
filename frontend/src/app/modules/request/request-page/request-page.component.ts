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

  public requestCreater!: FormGroup;

  public requestApprovers!: FormGroup;

  private ngUnsubscribe$: Subject<any> = new Subject();

  @ViewChild('requestWizard') wizard: ClrWizard;

  constructor(private formBuilder: FormBuilder) {}

  ngOnInit(): void {
    this.requestInfo = this.formBuilder.group({
      purchaseInitiator: ['', Validators.required],
      purchaseTarget: ['', Validators.required],
      responsiblePerson: ['', Validators.required],
    });

    this.requestInfo
      .get('purchaseInitiator')
      .valueChanges.pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe(value => console.log('Success!', value));
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
    console.log('Cancel!');
  }

  public onSubmit(): void {
    console.log('Success!');
  }
}
