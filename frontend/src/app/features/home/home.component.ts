import { Component, OnInit } from '@angular/core';
import { DynamicScriptLoaderService } from '@service/dynamic.script.loader.service';

declare let streamCam: any;
declare let streamCamRoom1: any;
declare let streamCamRoom2: any;

@Component({
  selector: 'fe-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  constructor(private dynamicScriptLoader: DynamicScriptLoaderService) {}

  ngOnInit(): void {
    this.loadScripts();
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
}
