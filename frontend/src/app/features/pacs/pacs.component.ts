import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { DepartmentComponent } from './department/department.component';
import { EmployeeComponent } from './employee/employee.component';
import { GuestComponent } from './guest/guest.component';

@Component({
  selector: 'fe-pacs',
  standalone: true,
  imports: [GuestComponent, EmployeeComponent, DepartmentComponent],
  templateUrl: './pacs.component.html',
  styleUrls: ['./pacs.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PacsComponent {
  // constructor() {}
  // ngOnInit(): void {}
}
