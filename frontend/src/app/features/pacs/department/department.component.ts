import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AsyncPipe, DatePipe } from '@angular/common';
import { ClarityModule } from '@clr/angular';
import { distinctUntilChanged, map, takeUntil, tap, filter } from 'rxjs/operators';
import { IPacsEvent } from '@model/pacs-event.model';
import { WebsocketService } from '@service/websocket.service';
import { Subject } from 'rxjs/internal/Subject';
import { Event } from '@service/websocket.service.event';
import { EmployeeNamePipe } from '@pipe/employeename.pipe';
import { Observable } from 'rxjs/internal/Observable';

@Component({
  selector: 'fe-pacs-department',
  standalone: true,
  imports: [ClarityModule, AsyncPipe, DatePipe, EmployeeNamePipe],
  templateUrl: './department.component.html',
  styleUrls: ['./department.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DepartmentComponent {
  public loading = true;

  public pacsLastEventArray$: Observable<IPacsEvent>;

  private ngUnsubscribe$: Subject<any> = new Subject();

  constructor(private wsService: WebsocketService) {
    this.pacsLastEventArray$ = this.wsService.on<any>(Event.EV_PACS_LAST_EVENT).pipe(
      distinctUntilChanged(),
      takeUntil(this.ngUnsubscribe$),
      tap(() => {
        this.loading = false;
      }),
      map(items => items.filter((item: any) => item.departmentId === '50' || item.Code === '49')),
    );
  }

  // ngOnInit(): void {}
  public ngOnDestroy(): void {
    this.ngUnsubscribe$.next(null);
    this.ngUnsubscribe$.complete();
  }
}
