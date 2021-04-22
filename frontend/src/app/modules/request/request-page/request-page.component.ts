import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'fe-request-page',
  templateUrl: './request-page.component.html',
  styleUrls: ['./request-page.component.scss'],
})
export class RequestPageComponent implements OnInit {
  public requestPageOpen: boolean;

  public requestForm!: FormGroup;

  constructor(private formBuilder: FormBuilder) {}

  ngOnInit(): void {
    this.requestForm = this.formBuilder.group({
      purchaseInitiator: ['', Validators.required],
      purchaseTarget: ['', Validators.required],
      responsiblePerson: ['', Validators.required],
      option1: ['', Validators.required],
    });
  }

  // convenience getter for easy access to form fields
  get f(): any {
    return this.requestForm.controls;
  }

  public open(msg?: string): void {
    this.requestPageOpen = true;
  }
}
