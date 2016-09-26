import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppDevModule } from './app/app-dev.module';
import { audioCtx } from './audio-context';
import { samples, samplesLoaded } from './samples';
import { hotModuleReplacement } from './hot_store';

if (process.env.ENV === 'production') {
  enableProdMode();
}

function main(initialState?: any) {
  return platformBrowserDynamic([
    {provide: 'audioCtx', useValue: audioCtx},
    {provide: 'samples', useValue: samples},
    {provide: 'samplesLoaded', useValue: samplesLoaded}
  ]).bootstrapModule(AppDevModule);
}

if((<any>module).hot) {
  hotModuleReplacement(main, module);
} else {
  document.addEventListener('DOMContentLoaded', () => main);
}
