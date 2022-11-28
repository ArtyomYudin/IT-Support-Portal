import { Component } from '@angular/core';
import { NgIf, NgFor, AsyncPipe, DatePipe } from '@angular/common';
import { ClarityModule } from '@clr/angular';

@Component({
  selector: 'fe-pacs-department',
  standalone: true,
  imports: [ClarityModule, NgIf, NgFor, AsyncPipe, DatePipe],
  templateUrl: './department.component.html',
  styleUrls: ['./department.component.scss'],
})
export class DepartmentComponent {
  public loading = false;

  // constructor() {}

  // ngOnInit(): void {}
}
