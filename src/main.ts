import { bootstrap } from '@angular/platform-browser-dynamic';
import { enableProdMode } from '@angular/core';
import { provideStore } from '@ngrx/store';
import { AppComponent } from './app/app.component';
import { counterReducer } from './app/counter.reducer';

if (process.env.ENV === 'production') {
  enableProdMode();
}

bootstrap(AppComponent, [
  provideStore({counter: counterReducer})
]);
