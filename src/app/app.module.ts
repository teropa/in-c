import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { Store, StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { MdButtonModule } from '@angular2-material/button';
import { MdIconModule } from '@angular2-material/icon';
import { MdProgressCircleModule } from '@angular2-material/progress-circle';
import { MdSliderModule } from '@angular2-material/slider';

import { provideHotStoreModule } from '../hot_store';
import { AppComponent } from './app.component';
import { PlayerComponent } from './ui/player.component';
import { AdvanceButtonComponent } from './ui/advance-button.component';
import { ProgressCircleComponent } from './ui/progress-circle.component';
import { SoundVisComponent } from './ui/sound-vis.component';
import { TopBarComponent } from './ui/top-bar.component';

import { appReducer } from './core/app.reducer';
import { PulseService } from './core/pulse.service';
import { TimeService } from './core/time.service';
import { AudioPlayerService } from './audio/audio-player.service';
import { SamplesService } from './audio/samples.service';

require('../fonts/texgyreadventor_regular_macroman/stylesheet.css');
require('../fonts/texgyreadventor_bold_macroman/stylesheet.css');

@NgModule({
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    HttpModule,
    provideHotStoreModule(appReducer),
    EffectsModule,
    MdButtonModule,
    MdIconModule.forRoot(),
    MdProgressCircleModule,
    MdSliderModule
  ],
  exports: [ AppComponent ],
  providers: [
    {provide: 'bpm', useValue: 220},
    AudioPlayerService,
    SamplesService,
    TimeService,
    PulseService
  ],
  declarations: [
    AppComponent,
    PlayerComponent,
    AdvanceButtonComponent,
    ProgressCircleComponent,
    SoundVisComponent,
    TopBarComponent
  ],
  bootstrap: [ AppComponent ]
})
export class AppModule {


}
