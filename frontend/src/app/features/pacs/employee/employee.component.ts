import { Component, OnDestroy } from '@angular/core';
import { NgIf, NgFor, AsyncPipe, DatePipe } from '@angular/common';
import { ClarityModule } from '@clr/angular';
import { Observable } from 'rxjs/internal/Observable';
import { distinctUntilChanged, takeUntil, tap } from 'rxjs/operators';
import { IPacsEvent } from '@model/pacs-event.model';
import { WebsocketService } from '@service/websocket.service';
import { Subject } from 'rxjs/internal/Subject';
import { Event } from '@service/websocket.service.event';
import { EmployeeNamePipe } from '@pipe/employeename.pipe';

@Component({
  selector: 'fe-pacs-employee',
  standalone: true,
  imports: [ClarityModule, NgIf, NgFor, AsyncPipe, DatePipe, EmployeeNamePipe],
  templateUrl: './employee.component.html',
  styleUrls: ['./employee.component.scss'],
})
export class EmployeeComponent implements OnDestroy {
  public loading = true;

  public pacsEventArray$: Observable<IPacsEvent>;

  private ngUnsubscribe$: Subject<any> = new Subject();

  constructor(private wsService: WebsocketService) {
    this.pacsEventArray$ = this.wsService.on<IPacsEvent>(Event.EV_PACS_ENTRY_EXIT).pipe(
      distinctUntilChanged(),
      takeUntil(this.ngUnsubscribe$),
      tap(() => {
        this.loading = false;
      }),
    );
  }

  // ngOnInit(): void {}
  public ngOnDestroy(): void {
    this.ngUnsubscribe$.next(null);
    this.ngUnsubscribe$.complete();
  }
}
