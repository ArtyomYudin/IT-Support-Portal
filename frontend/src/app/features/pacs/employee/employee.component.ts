import { Component } from '@angular/core';
import { NgIf, NgFor, AsyncPipe, DatePipe } from '@angular/common';
import { ClarityModule } from '@clr/angular';

@Component({
  selector: 'fe-pacs-employee',
  standalone: true,
  imports: [ClarityModule, NgIf, NgFor, AsyncPipe, DatePipe],
  templateUrl: './employee.component.html',
  styleUrls: ['./employee.component.scss'],
})
export class EmployeeComponent {
  public loading = false;

  // constructor() {}

  // ngOnInit(): void {}
}
