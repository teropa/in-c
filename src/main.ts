import { bootstrap } from '@angular/platform-browser-dynamic';
import { enableProdMode } from '@angular/core';
import { provideStore } from '@ngrx/store';
import { runEffects } from '@ngrx/effects';

import { AppComponent } from './app/app.component';
import { appReducer } from './app/app.reducer';
import { BeatService } from './app/beat.service';
import { PlayerService } from './app/player.service';
import { SamplesService } from './app/samples.service';

if (process.env.ENV === 'production') {
  enableProdMode();
}

function main(hmrState?: any) {
  return bootstrap(AppComponent, [
    provideStore(appReducer, hmrState),
    runEffects(BeatService),
    runEffects(PlayerService),
    {provide: 'bpm', useValue: 180},
    {provide: 'audioCtx', useValue: new AudioContext()},
    SamplesService
  ]);
}

if (process.env.ENV !== 'production') {
  let ngrxHmr = require('ngrx-store-hmr/lib/index').hotModuleReplacement;
  ngrxHmr(main, module);
} else {
  document.addEventListener('DOMContentLoaded', () => main());
}