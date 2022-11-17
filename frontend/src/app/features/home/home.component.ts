import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { Subject } from 'rxjs/internal/Subject';
import { distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { Chart, registerables } from 'chart.js';
import { DynamicScriptLoaderService } from '@service/dynamic.script.loader.service';
import { WebsocketService } from '@service/websocket.service';
import { Event } from '@service/websocket.service.event';

declare let streamCam: any;
declare let streamCamRoom1: any;
declare let streamCamRoom2: any;

Chart.register(...registerables);

@Component({
  selector: 'fe-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent implements OnInit, OnDestroy {
  public vpnActiveSessionCountArray$: Observable<any>;

  private ngUnsubscribe$: Subject<any> = new Subject();

  private mainCamPlayer: any;

  private room1CamPlayer: any;

  private room2CamPlayer: any;

  constructor(private dynamicScriptLoader: DynamicScriptLoaderService, private wsService: WebsocketService) {
    this.vpnActiveSessionCountArray$ = this.wsService
      .on<any>(Event.EV_VPN_ACTIVE_SESSION_COUNT)
      .pipe(distinctUntilChanged(), takeUntil(this.ngUnsubscribe$));
  }

  public ngOnInit(): void {
    this.wsService.send('getDashboardEvent', null);
    this.loadScripts();
  }

  public ngOnDestroy(): void {
    this.ngUnsubscribe$.next(null);
    this.ngUnsubscribe$.complete();
    this.mainCamPlayer.destroy();
    this.room1CamPlayer.destroy();
    this.room2CamPlayer.destroy();
  }

  private loadScripts() {
    this.dynamicScriptLoader
      .load('jsmpeg', 'videocanvas')
      .then(() => {
        // Script Loaded Successfully
        this.mainCamPlayer = streamCam();
        this.room1CamPlayer = streamCamRoom1();
        this.room2CamPlayer = streamCamRoom2();
      })
      .catch(error => console.log(error));
  }
}
