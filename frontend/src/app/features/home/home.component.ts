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
  @ViewChild('chart', { static: true }) public refChart: ElementRef;

  @ViewChild('chart2', { static: true }) public refChart2: ElementRef;

  @ViewChild('chart3', { static: true }) public refChart3: ElementRef;

  public providerListArray$: Observable<any>;

  public providerInfoSubscription: SubscriptionLike;

  private chart: any;

  private chart2: any;

  private chart3: any;

  private inSpeedInfo: any = [];

  private outSpeedInfo: any = [];

  private ngUnsubscribe$: Subject<any> = new Subject();

  constructor(private dynamicScriptLoader: DynamicScriptLoaderService, private wsService: WebsocketService) {
    this.providerListArray$ = this.wsService.on<any>(Event.EV_PROVIDER_INFO).pipe(distinctUntilChanged(), takeUntil(this.ngUnsubscribe$));
  }

  ngOnInit(): void {
    this.loadScripts();
    this.providerSpeedChart();
    this.createChart2();
    this.createChart3();
    this.providerInfoSubscription = this.providerListArray$.subscribe(value => {
      this.inSpeedInfo.length = 0;
      this.outSpeedInfo.length = 0;
      this.inSpeedInfo.push(value.inSpeedOrange, value.inSpeedTelros, value.inSpeedFilanco);
      this.outSpeedInfo.push(value.outSpeedOrange, value.outSpeedTelros, value.outSpeedFilanco);
      // this.chart.data.datasets[0].forEach((dataset: any) => {
      //   dataset.data.push([1001]);
      // });
      this.chart.update('none');
    });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe$.next(null);
    this.ngUnsubscribe$.complete();
    this.providerInfoSubscription.unsubscribe();
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

  centerTextPlugin = {
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

  providerSpeedChart() {
    const chart = this.refChart.nativeElement;
    const ctx = chart.getContext('2d');
    this.chart = new Chart(ctx, {
      type: 'bar', // this denotes tha type of chart
      data: {
        // values on X-Axis
        labels: ['Orange', 'Телрос', 'Филанка'],
        datasets: [
          {
            label: 'Входящий траффик',
            data: this.inSpeedInfo,
            backgroundColor: 'hsl(93, 79%, 40%)',
          },
          {
            label: 'Исходящий траффик',
            data: this.outSpeedInfo,
            backgroundColor: 'hsl(198, 66%, 57%)',
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
            grace: '10%',
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

  createChart2() {
    const chart2 = this.refChart2.nativeElement;
    const ctx = chart2.getContext('2d');
    this.chart2 = new Chart(ctx, {
      type: 'doughnut', // this denotes tha type of chart

      data: {
        // values on X-Axis
        labels: ['Маршрутизаторы', 'Коммутаторы', 'ИБП', 'Сервера'],
        datasets: [
          {
            data: ['0', '9', '2', '1'],
            backgroundColor: ['hsl(198, 66%, 57%)', 'hsl(198, 66%, 57%)', 'hsl(282, 43%, 54%)', 'hsl(93, 67%, 38%)'],
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

                // eslint-disable-next-line no-param-reassign
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
            text: '20',
            color: 'red',
            fontStyle: "'Metropolis','Avenir Next','Helvetica Neue','Arial','sans-serif'",
            sidePadding: 20,
          },
        },
      },
    });
  }

  createChart3() {
    const chart3 = this.refChart3.nativeElement;
    const ctx = chart3.getContext('2d');
    this.chart3 = new Chart(ctx, {
      type: 'doughnut', // this denotes tha type of chart

      data: {
        // values on X-Axis
        labels: ['Свободные', 'Занятые'],
        datasets: [
          {
            data: ['52', '8'],
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

                // eslint-disable-next-line no-param-reassign
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
            text: '8',
            color: 'red',
            fontStyle: "'Metropolis','Avenir Next','Helvetica Neue','Arial','sans-serif'",
            sidePadding: 20,
          },
        },
      },
    });
  }
}
