import { ChangeDetectionStrategy, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { DynamicScriptLoaderService } from '@service/dynamic.script.loader.service';

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

  public chart: any;

  public chart2: any;

  constructor(private dynamicScriptLoader: DynamicScriptLoaderService) {}

  ngOnInit(): void {
    this.loadScripts();
    this.createChart();
    this.createChart2();
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

  createChart() {
    const chart = this.refChart.nativeElement;
    const ctx = chart.getContext('2d');
    this.chart = new Chart(ctx, {
      type: 'bar', // this denotes tha type of chart

      data: {
        // values on X-Axis
        labels: ['Оранже', 'Телрос', 'Филанка'],
        datasets: [
          {
            label: 'Исходящий траффик',
            data: ['29', '2', '12'],
            backgroundColor: 'rgba(153, 102, 255, 0.2)',
          },
          {
            label: 'Входящий траффик',
            data: ['54', '34', '56'],
            backgroundColor: ['rgba(75, 192, 192, 0.2)', 'rgba(75, 192, 192, 0.2)', 'rgba(75, 192, 192, 0.2)'],
          },
        ],
      },
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
            backgroundColor: ['hsla(198, 66%, 57%, 0.5)', 'hsla(198, 66%, 57%, 0.5)', 'hsla(282, 43%, 54%, 0.5)', 'hsl(93, 67%, 38%, 0.5)'],
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
}
