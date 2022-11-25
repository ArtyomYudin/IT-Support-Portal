import { Component, OnInit } from '@angular/core';

import { AvayaCDRComponent } from './avaya-cdr/avaya-cdr.component';

@Component({
  selector: 'fe-avaya',
  standalone: true,
  imports: [AvayaCDRComponent],
  templateUrl: './avaya.component.html',
  styleUrls: ['./avaya.component.scss'],
})
export default class AvayaComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}
