import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
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
})
export class HomeComponent implements OnInit {
  @ViewChild('chart', { static: true }) public refChart: ElementRef;

  public chart: any;

  constructor(private dynamicScriptLoader: DynamicScriptLoaderService) {}

  ngOnInit(): void {
    this.loadScripts();
    this.createChart();
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
        // aspectRatio: 2.5,
      },
    });
  }
}
