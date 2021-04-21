import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'fe-request-page',
  templateUrl: './request-page.component.html',
  styleUrls: ['./request-page.component.scss'],
})
export class RequestPageComponent implements OnInit {
  public requestPageOpen: boolean;

  constructor() {}

  ngOnInit(): void {}

  public open(msg?: string): void {
    this.requestPageOpen = true;
  }
}
