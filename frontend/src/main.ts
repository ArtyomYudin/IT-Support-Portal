import './polyfills';

import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}
platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .then(ref => {
    const win = window as any;
    // Ensure Angular destroys itself on hot reloads.
    if (win.ngRef) {
      win.ngRef.destroy();
    }
    win.ngRef = ref;

    // Otherwise, log the boot error
  })
  .catch(err => console.error(err));
