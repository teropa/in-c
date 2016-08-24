import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { provideStore } from '@ngrx/store';
import { AppModule } from './app.module';
import { appReducer } from './app/app.reducer';
import { hotModuleReplacement } from './hot_store';

if (process.env.ENV === 'production') {
  enableProdMode();
}

const audioCtx = new AudioContext();

function main(initialState?: any) {
  return platformBrowserDynamic([
    provideStore(appReducer, initialState),
    {provide: 'audioCtx', useValue: audioCtx}
  ]).bootstrapModule(AppModule);
}

if((<any>module).hot) {
  hotModuleReplacement(main, module);
} else {
  document.addEventListener('DOMContentLoaded', () => main);
}
