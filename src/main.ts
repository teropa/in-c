import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';
import { audioCtx } from './audio-context';
import { hotModuleReplacement } from './hot_store';

if (process.env.ENV === 'production') {
  enableProdMode();
}

function main(initialState?: any) {
  return platformBrowserDynamic([
    {provide: 'audioCtx', useValue: audioCtx}
  ]).bootstrapModule(AppModule);
}

if((<any>module).hot) {
  hotModuleReplacement(main, module);
} else {
  document.addEventListener('DOMContentLoaded', () => main);
}
