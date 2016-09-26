import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';
import { audioCtx } from './audio-context';
import {samples, samplesLoaded } from './samples';

if (process.env.ENV === 'production') {
  enableProdMode();
}

platformBrowserDynamic([
  {provide: 'audioCtx', useValue: audioCtx},
  {provide: 'samples', useValue: samples},
  {provide: 'samplesLoaded', useValue: samplesLoaded}
]).bootstrapModule(AppModule);
