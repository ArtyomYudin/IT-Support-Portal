import { Component, Input, OnInit } from '@angular/core';
import { AuthUser } from '@model/auth-user.model';

@Component({
  selector: 'fe-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
})
export class MainComponent implements OnInit {
  @Input() currentUser: AuthUser;

  constructor() {}

  ngOnInit() {}
}
