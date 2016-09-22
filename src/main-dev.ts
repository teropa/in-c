import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppDevModule } from './app/app-dev.module';
import { audioCtx } from './audio-context';
import { soundFonts } from './soundfonts';
import { hotModuleReplacement } from './hot_store';

if (process.env.ENV === 'production') {
  enableProdMode();
}

function main(initialState?: any) {
  return platformBrowserDynamic([
    {provide: 'audioCtx', useValue: audioCtx},
    {provide: 'soundFonts', useValue: soundFonts}
  ]).bootstrapModule(AppDevModule);
}

if((<any>module).hot) {
  hotModuleReplacement(main, module);
} else {
  document.addEventListener('DOMContentLoaded', () => main);
}
