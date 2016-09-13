import { NgModule, ApplicationRef } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { Store, StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { MdProgressCircleModule } from '@angular2-material/progress-circle';
import { MdSliderModule } from '@angular2-material/slider';

import { provideHotStoreModule } from '../hot_store';
import { AppComponent } from './app.component';
import { BackgroundComponent } from './ui/background.component';
import { PlayerComponent } from './ui/player.component';
import { TopBarComponent } from './ui/top-bar.component';

import { appReducer } from './core/app.reducer';
import { PulseService } from './core/pulse.service';
import { TimeService } from './core/time.service';
import { AudioPlayerService } from './audio/audio-player.service';
import { SamplesService } from './audio/samples.service';
import { ColorService } from './ui/color.service';

@NgModule({
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    provideHotStoreModule(appReducer),
    EffectsModule,
    MdProgressCircleModule,
    MdSliderModule
  ],
  providers: [
    {provide: 'bpm', useValue: 180},
    AudioPlayerService,
    SamplesService,
    TimeService,
    PulseService,
    ColorService
  ],
  declarations: [
    AppComponent,
    BackgroundComponent,
    PlayerComponent,
    TopBarComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule {


}
