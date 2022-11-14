import { ChangeDetectionStrategy, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { Subject } from 'rxjs/internal/Subject';
import { distinctUntilChanged, takeUntil, tap } from 'rxjs/operators';
import { Chart, registerables } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { DynamicScriptLoaderService } from '@service/dynamic.script.loader.service';
import { WebsocketService } from '@service/websocket.service';
import { Event } from '@service/websocket.service.event';
import { SubscriptionLike } from 'rxjs';

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
export class HomeComponent implements OnInit {
  @ViewChild('providerSpeedChart', { static: true }) public refProviderSpeedChart: ElementRef;

  @ViewChild('hwAlarmChart', { static: true }) public refHWAlarmChart: ElementRef;

  @ViewChild('avayaE1Chart', { static: true }) public refAvayaE1Chart: ElementRef;

  @ViewChild('avayaE1DailyChart', { static: true }) public refAvayaE1DailyChart: ElementRef;

  public providerListArray$: Observable<any>;

  public avayaE1ListArray$: Observable<any>;

  public hwGroupAlarmListArray$: Observable<any>;

  public vpnActiveSessionCountArray$: Observable<any>;

  public providerInfoSubscription: SubscriptionLike;

  public avayaE1InfoSubscription: SubscriptionLike;

  public hwGroupAlarmSubscription: SubscriptionLike;

  private providerSpeedChart: any;

  private hwAlarmChart: any;

  private avayaE1Chart: any;

  private avayaE1DailyChart: any;

  private inSpeedInfo: any = [];

  private outSpeedInfo: any = [];

  private avayaE1Channel: any = [60, 0];

  private avayaE1DailyChannel: any = [
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 0, 1, 2, 3, 4, 5, 6, 7, 8,
    9, 10, 11, 12, 13, 14, 15,
  ];

  private hwAlarmLabel: any = ['Сбоев'];

  private hwAlarmValue: any = [0];

  private ngUnsubscribe$: Subject<any> = new Subject();

  constructor(private dynamicScriptLoader: DynamicScriptLoaderService, private wsService: WebsocketService) {
    this.providerListArray$ = this.wsService.on<any>(Event.EV_PROVIDER_INFO).pipe(distinctUntilChanged(), takeUntil(this.ngUnsubscribe$));
    this.avayaE1ListArray$ = this.wsService.on<any>(Event.EV_AVAYA_E1_INFO).pipe(distinctUntilChanged(), takeUntil(this.ngUnsubscribe$));
    this.hwGroupAlarmListArray$ = this.wsService
      .on<any>(Event.EV_HARDWARE_GROUP_ALARM)
      .pipe(distinctUntilChanged(), takeUntil(this.ngUnsubscribe$));
    this.vpnActiveSessionCountArray$ = this.wsService
      .on<any>(Event.EV_VPN_ACTIVE_SESSION_COUNT)
      .pipe(distinctUntilChanged(), takeUntil(this.ngUnsubscribe$));
  }

  public ngOnInit(): void {
    this.wsService.send('getDashboardEvent', null);
    this.loadScripts();
    this.createProviderSpeedChart();
    this.createHWAlarmChart();
    this.createAvayaE1Chart();
    this.createAvayaE1DailyChart();
    this.providerInfoSubscription = this.providerListArray$.subscribe(value => {
      this.inSpeedInfo.length = 0;
      this.outSpeedInfo.length = 0;
      this.inSpeedInfo.push(value.inSpeedOrange, value.inSpeedTelros, value.inSpeedFilanco);
      this.outSpeedInfo.push(value.outSpeedOrange, value.outSpeedTelros, value.outSpeedFilanco);
      this.providerSpeedChart.update('none');
    });
    this.avayaE1InfoSubscription = this.avayaE1ListArray$.subscribe(value => {
      this.avayaE1Channel.length = 0;
      this.avayaE1Channel.push(value.allChannel - value.activeChannel, value.activeChannel);
      this.avayaE1Chart.options.plugins.centerText.text = value.activeChannel;
      this.avayaE1Chart.update('none');
    });
    this.hwGroupAlarmSubscription = this.hwGroupAlarmListArray$.subscribe(groupAlarm => {
      this.hwAlarmLabel.length = 0;
      this.hwAlarmValue.length = 0;
      groupAlarm.forEach((group: { group: any; count: any }) => {
        if (group.count !== 0) {
          this.hwAlarmLabel.push(group.group);
          this.hwAlarmValue.push(group.count);
        }
      });
      this.hwAlarmChart.options.plugins.centerText.text = this.hwAlarmValue.reduce((sum: any, elem: any) => {
        return sum + elem;
      }, 0);
      this.hwAlarmChart.update('none');
    });
  }

  public ngOnDestroy(): void {
    this.ngUnsubscribe$.next(null);
    this.ngUnsubscribe$.complete();
    this.providerInfoSubscription.unsubscribe();
    this.avayaE1InfoSubscription.unsubscribe();
  }

  private loadScripts() {
    this.dynamicScriptLoader
      .load('jsmpeg', 'videocanvas')
      .then(() => {
        // Script Loaded Successfully
        streamCam();
        streamCamRoom1();
        streamCamRoom2();
      })
      .catch(error => console.log(error));
  }

  private centerTextPlugin = {
    id: 'centerText',
    beforeDraw(chart: any, args: any, options: any) {
      // Get ctx from string
      const { ctx } = chart;
      ctx.save();
      // Get options from the center object in options

      const fontStyle = options.fontStyle || 'Arial';
      const txt = options.text;
      const color = options.color || '#000';
      const sidePadding = options.sidePadding || 20;
      const sidePaddingCalculated = (sidePadding / 100) * (chart.innerRadius * 2);
      // Start with a base font of 30px
      ctx.font = `30px ${fontStyle}`;

      // Get the width of the string and also the width of the element minus 10 to give it 5px side padding
      const stringWidth = ctx.measureText(txt).width;
      const elementWidth = chart.innerRadius * 2 - sidePaddingCalculated;

      // Find out how much the font can grow in width.
      const widthRatio = elementWidth / stringWidth;
      const newFontSize = Math.floor(30 * widthRatio);
      const elementHeight = chart.innerRadius * 2;

      // Pick a new font size so it will not be larger than the height of label.
      const fontSizeToUse = Math.min(newFontSize, elementHeight);

      // Set font settings to draw it correctly.
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const centerX = (chart.chartArea.left + chart.chartArea.right) / 2;
      const centerY = (chart.chartArea.top + chart.chartArea.bottom) / 2;
      ctx.font = `${fontSizeToUse}px ${fontStyle}`;
      ctx.fillStyle = color;

      // Draw text in center
      ctx.fillText(txt, centerX, centerY);
      ctx.restore();
    },
  };

  private createProviderSpeedChart() {
    const providerSpeedChart = this.refProviderSpeedChart.nativeElement;
    const ctx = providerSpeedChart.getContext('2d');
    this.providerSpeedChart = new Chart(ctx, {
      type: 'bar',
      data: {
        // values on X-Axis
        labels: ['Orange', 'Телрос', 'Филанка'],
        datasets: [
          {
            label: 'Входящий траффик',
            data: this.inSpeedInfo,
            backgroundColor: 'hsl(93, 79%, 40%)',
            borderWidth: 0,
          },
          {
            label: 'Исходящий траффик',
            data: this.outSpeedInfo,
            backgroundColor: 'hsl(198, 66%, 57%)',
            borderWidth: 0,
          },
        ],
      },
      plugins: [ChartDataLabels],
      options: {
        indexAxis: 'y',
        elements: {
          bar: {
            borderWidth: 2,
          },
        },
        plugins: {
          legend: {
            display: false,
          },
          datalabels: {
            anchor: 'end',
            align: 'end',
            clamp: true,
            clip: false,
            font: {
              size: 11,
            },
          },
        },
        scales: {
          y: {
            ticks: {
              font: {
                family: "'Metropolis','Avenir Next','Helvetica Neue','Arial','sans-serif'",
                size: 13,
                weight: '500',
              },
            },
          },
          x: {
            type: 'linear',
            grace: '12%',
            ticks: {
              font: {
                family: "'Metropolis','Avenir Next','Helvetica Neue','Arial','sans-serif'",
                size: 13,
                weight: '500',
              },
            },
          },
        },
        aspectRatio: 2.5,
      },
    });
  }

  private createHWAlarmChart() {
    const hwAlarmChart = this.refHWAlarmChart.nativeElement;
    const ctx = hwAlarmChart.getContext('2d');
    this.hwAlarmChart = new Chart(ctx, {
      type: 'doughnut', // this denotes tha type of chart

      data: {
        // values on X-Axis
        labels: this.hwAlarmLabel,
        datasets: [
          {
            data: this.hwAlarmValue,
            backgroundColor: [
              'hsl(198, 100%, 24%)',
              'hsl(14, 91%, 55%)',
              'hsl(198, 100%, 41%)',
              'hsl(198, 100%, 34%))',
              'hsl(14, 83%, 84%)',
              'hsl(198, 57%, 85%)',
            ],
          },
        ],
      },
      plugins: [this.centerTextPlugin],
      options: {
        aspectRatio: 2.5,
        // responsive: true,
        cutout: 40,
        plugins: {
          legend: {
            display: true,
            position: 'left',
            labels: {
              filter: (legendItem, data) => {
                const label = legendItem.text;
                const labelIndex = data.labels.findIndex(labelName => labelName === label);
                const qtd = data.datasets[0].data[labelIndex];
                legendItem.text = `${legendItem.text} : ${qtd}`;
                // return (qtd !=='0')?true:false;
                return true;
              },
              font: {
                family: "'Metropolis','Avenir Next','Helvetica Neue','Arial','sans-serif'",
                size: 13,
                weight: '500',
              },
            },
          },
          title: {
            display: false,
          },
          centerText: {
            text: this.hwAlarmValue[0],
            color: 'red',
            fontStyle: "'Metropolis','Avenir Next','Helvetica Neue','Arial','sans-serif'",
            sidePadding: 20,
          },
        },
      },
    });
  }

  private createAvayaE1Chart() {
    const avayaE1Chart = this.refAvayaE1Chart.nativeElement;
    const ctx = avayaE1Chart.getContext('2d');
    this.avayaE1Chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        // values on X-Axis
        labels: ['Свободные', 'Занятые'],
        datasets: [
          {
            data: this.avayaE1Channel,
            backgroundColor: ['hsl(93, 79%, 40%)', 'hsl(48, 94%, 57%)'],
          },
        ],
      },
      plugins: [this.centerTextPlugin],
      options: {
        aspectRatio: 2.5,
        // responsive: true,
        cutout: 40,
        layout: {
          padding: 0,
        },
        plugins: {
          legend: {
            display: true,
            position: 'left',
            labels: {
              filter: (legendItem, data) => {
                const label = legendItem.text;
                const labelIndex = data.labels.findIndex(labelName => labelName === label);
                const qtd = data.datasets[0].data[labelIndex];
                legendItem.text = `${legendItem.text} : ${qtd}`;
                // return (qtd !=='0')?true:false;
                return true;
              },
              font: {
                family: "'Metropolis','Avenir Next','Helvetica Neue','Arial','sans-serif'",
                size: 13,
                weight: '500',
              },
            },
          },
          title: {
            display: false,
          },
          centerText: {
            text: this.avayaE1Channel[1],
            color: 'red',
            fontStyle: "'Metropolis','Avenir Next','Helvetica Neue','Arial','sans-serif'",
            sidePadding: 20,
          },
        },
      },
    });
  }

  private createAvayaE1DailyChart() {
    const avayaE1DailyChart = this.refAvayaE1DailyChart.nativeElement;
    const ctx = avayaE1DailyChart.getContext('2d');
    this.avayaE1DailyChart = new Chart(ctx, {
      type: 'line',
      data: {
        // values on X-Axis
        // labels: ['Свободные', 'Занятые'],
        labels: [
          '8:00',
          '8:30',
          '09:00',
          '09:30',
          '10:00',
          '10:30',
          '11:00',
          '11:30',
          '12:00',
          '12:30',
          '13:00',
          '13:30',
          '14:00',
          '14:30',
          '15:00',
          '15:30',
          '16:00',
          '16:30',
          '17:00',
          '17:30',
          '18:00',
          '18:30',
          '19:00',
          '19:30',
          '20:00',
          '20:30',
          '21:00',
          '21:30',
          '22:00',
          '22:30',
          '23:00',
          '23:30',
        ],
        datasets: [
          {
            data: this.avayaE1DailyChannel,
            backgroundColor: 'hsl(93, 79%, 40%)',
          },
        ],
      },
      options: {
        // aspectRatio: 2.5,
        // responsive: true,
        // cutout: 40,
        layout: {
          padding: 0,
        },
        plugins: {
          legend: {
            display: false,
            position: 'left',
          },
          title: {
            display: false,
          },
        },
      },
    });
  }
}
