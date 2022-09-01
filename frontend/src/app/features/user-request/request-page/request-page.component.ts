import { Component, OnInit, ViewChild } from '@angular/core';
import { Validators, FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { ClrModal } from '@clr/angular';

@Component({
  selector: 'fe-user-request-page',
  templateUrl: './request-page.component.html',
  styleUrls: ['./request-page.component.scss'],
})
export class RequestPageComponent implements OnInit {
  public basic: boolean;

  requestInfo: FormGroup;

  @ViewChild('userRequestModal') wizard: ClrModal;

  constructor(private formBuilder: FormBuilder) {}

  ngOnInit(): void {
    this.requestInfo = this.formBuilder.group({
      test: [''],
    });
  }

  public onOpen(): void {
    this.basic = true;
  }

  public onChange(event: any): void {
    console.log(event.target.files);
  }

  public onClose(): void {
    this.basic = false;
    console.log(this.requestInfo.controls.test.value);
  }
}
