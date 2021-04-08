import { Component, OnDestroy, OnInit } from '@angular/core';
import { map, takeUntil } from 'rxjs/operators';
import { Subject, interval } from 'rxjs';

@Component({
  selector: 'fe-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  public clock = interval(1000).pipe(map(() => new Date()));

  private ngUnsubscribe$: Subject<any> = new Subject();

  constructor() {}

  ngOnInit(): void {}

  public ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
