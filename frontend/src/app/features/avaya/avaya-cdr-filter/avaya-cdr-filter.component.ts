import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'fe-avaya-cdr-filter',
  templateUrl: './avaya-cdr-filter.component.html',
  styleUrls: ['./avaya-cdr-filter.component.scss'],
})
export class AvayaCDRFilterComponent implements OnInit {
  public options: string[] = ['1 час', '6 часов', '1 день', '1 неделя', '2 недели', '30 дней', '90 дней', '180 дней'];

  constructor() {}

  ngOnInit(): void {}
}
