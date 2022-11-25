/*
import { Component } from '@angular/core';

@Component({
  selector: 'fe-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  constructor() {}

  title = 'it-support-portal-frontend';
}
*/

import { Component } from '@angular/core';
// import { UiModule } from '@core/ui/ui.module';
import { LayoutComponent } from '@core/ui/layout/layout.component';

@Component({
  selector: 'fe-root',
  standalone: true,
  imports: [LayoutComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  constructor() {}

  title = 'it-support-portal-frontend';
}
