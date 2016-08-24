import { NgModule, ApplicationRef } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { Store, StoreModule } from '@ngrx/store';
import { runEffects } from '@ngrx/effects';

import { provideHotStoreModule } from './hot_store';
import { AppComponent } from './app/app.component';
import { appReducer } from './app/app.reducer';
import { PulseService } from './app/pulse.service';
import { PlayerService } from './app/player.service';
import { SamplesService } from './app/samples.service';
import { TimeService } from './app/time.service';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    provideHotStoreModule(appReducer)
  ],
  providers: [
    runEffects(PlayerService),
    {provide: 'bpm', useValue: 180},
    SamplesService,
    TimeService,
    PulseService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {


}
