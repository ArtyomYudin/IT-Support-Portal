import { Component, OnInit } from '@angular/core';

import { RequestListComponent } from './request-list/request-list.component';

@Component({
  selector: 'fe-user-request',
  standalone: true,
  imports: [RequestListComponent],
  templateUrl: './user-request.component.html',
  styleUrls: ['./user-request.component.scss'],
})
export default class UserRequestComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}
