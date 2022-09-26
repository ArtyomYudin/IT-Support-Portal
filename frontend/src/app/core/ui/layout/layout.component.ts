import { Component, OnInit, OnDestroy } from '@angular/core';
import { takeUntil, share, distinctUntilChanged } from 'rxjs/operators';
import { Subject } from 'rxjs/internal/Subject';
import { WebsocketService } from '@service/websocket.service';
import { AuthenticationService } from '@service/auth.service';
import { AuthUser } from '@model/auth-user.model';

@Component({
  selector: 'fe-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
})
export class LayoutComponent implements OnInit, OnDestroy {
  public isConnected: boolean;

  public currentUser: AuthUser;

  private ngUnsubscribe$: Subject<any> = new Subject();

  constructor(private wsService: WebsocketService, private authenticationService: AuthenticationService) {
    this.wsService.status.pipe(share(), distinctUntilChanged(), takeUntil(this.ngUnsubscribe$)).subscribe(isConnected => {
      this.isConnected = isConnected;
    });
    this.authenticationService.currentUser$.pipe(takeUntil(this.ngUnsubscribe$)).subscribe(x => {
      this.currentUser = x;
    });
  }

  ngOnInit(): void {}

  public ngOnDestroy() {
    this.ngUnsubscribe$.next(null);
    this.ngUnsubscribe$.complete();
  }
}
