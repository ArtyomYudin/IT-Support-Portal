import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { Subject } from 'rxjs/internal/Subject';
import { SubscriptionLike } from 'rxjs/internal/types';
import { WebsocketService } from '@service/websocket.service';
import { distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { Event } from '@service/websocket.service.event';
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
export default class PacsComponent implements OnInit {
  public departmentStructureArray$: Observable<any>;

  public departmentStructureSubscription: SubscriptionLike;

  public departmentStructure: any[];

  private ngUnsubscribe$: Subject<any> = new Subject();

  constructor(private wsService: WebsocketService) {
    this.departmentStructureArray$ = this.wsService
      .on<any>(Event.EV_DEPARTMENT_STRUCTURE_BY_UPN)
      .pipe(distinctUntilChanged(), takeUntil(this.ngUnsubscribe$));
  }

  ngOnInit(): void {
    this.wsService.send('getPacsInitValue');
    this.wsService.send(
      'getDepartmentStructureByUPN',
      localStorage.getItem('IT-Support-Portal') ? JSON.parse(localStorage.getItem('IT-Support-Portal')).id : null,
    );
    this.departmentStructureSubscription = this.departmentStructureArray$.subscribe(date => {
      this.departmentStructure = date;
    });
  }

  public ngOnDestroy(): void {
    this.ngUnsubscribe$.next(null);
    this.ngUnsubscribe$.complete();
    this.departmentStructureSubscription.unsubscribe();
  }
}
