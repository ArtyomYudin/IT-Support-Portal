import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DynamicScriptLoaderService } from '@service/dynamic.script.loader.service';

declare let streamCam: any;

@Component({
  selector: 'fe-pacs-guest',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './guest.component.html',
  styleUrls: ['./guest.component.scss'],
})
export class GuestComponent implements OnInit, OnDestroy {
  private mainCamPlayer: any;

  constructor(private dynamicScriptLoader: DynamicScriptLoaderService) {}

  public ngOnInit(): void {
    this.loadScripts();
  }

  public ngOnDestroy(): void {
    this.mainCamPlayer.destroy();
  }

  private loadScripts() {
    this.dynamicScriptLoader
      .load('jsmpeg', 'videocanvas')
      .then(() => {
        // Script Loaded Successfully
        this.mainCamPlayer = streamCam();
      })
      .catch(error => console.log(error));
  }
}
