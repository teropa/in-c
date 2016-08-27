import { NgModule, ApplicationRef } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { Store, StoreModule } from '@ngrx/store';
import { runEffects } from '@ngrx/effects';

import { provideHotStoreModule } from './hot_store';
import { AppComponent } from './app/app.component';
import { PlayerComponent } from './app/player.component';
import { appReducer } from './app/app.reducer';
import { PulseService } from './app/pulse.service';
import { AudioPlayerService } from './app/audio-player.service';
import { SamplesService } from './app/samples.service';
import { TimeService } from './app/time.service';
import { ColorService } from './app/color.service';

require('./main.css');

@NgModule({
  imports: [
    BrowserModule,
    provideHotStoreModule(appReducer)
  ],
  providers: [
    runEffects(AudioPlayerService),
    {provide: 'bpm', useValue: 180},
    SamplesService,
    TimeService,
    PulseService,
    ColorService
  ],
  declarations: [AppComponent, PlayerComponent],
  bootstrap: [AppComponent]
})
export class AppModule {


}
