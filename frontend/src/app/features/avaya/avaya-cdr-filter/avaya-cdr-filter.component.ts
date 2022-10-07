import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'fe-avaya-cdr-filter',
  templateUrl: './avaya-cdr-filter.component.html',
  styleUrls: ['./avaya-cdr-filter.component.scss'],
})
export class AvayaCDRFilterComponent implements OnInit {
  public options: any[] = [
    { name: '1 час', value: 1 },
    { name: '6 часов', value: 6 },
    { name: '1 день', value: 24 },
    { name: '1 неделя', value: 168 },
    { name: '2 недели', value: 336 },
    { name: '30 дней', value: 720 },
    { name: '90 дней', value: 2160 },
    { name: '180 дней', value: 4320 },
  ];

  public avayaFilter: FormGroup;

  constructor(private formBuilder: FormBuilder) {}

  ngOnInit(): void {
    this.avayaFilter = this.formBuilder.group({
      avayaViewPeriod: [{ name: '6 часов', value: 6 }],
    });
  }
}
