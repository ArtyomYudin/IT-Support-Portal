import { Component } from '@angular/core';
import { loadCoreIconSet, loadTechnologyIconSet } from '@cds/core/icon';

@Component({
  selector: 'fe-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  constructor() {
    loadCoreIconSet();
    loadTechnologyIconSet();
  }

  title = 'it-support-portal-frontend';
}
