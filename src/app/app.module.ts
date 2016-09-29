import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { Store, StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { MdButtonModule } from '@angular2-material/button';
import { MdIconModule } from '@angular2-material/icon';

import { provideHotStoreModule } from '../hot_store';
import { AppComponent } from './app.component';
import { ContainerComponent } from './ui/container.component';
import { TitleComponent } from './ui/intro/title.component';
import { IntroComponent } from './ui/intro/intro.component';
import { PlayersComponent } from './ui/players/players.component';
import { PlayerComponent } from './ui/players/player.component';
import { AdvanceButtonComponent } from './ui/players/advance-button.component';
import { ProgressCircleComponent } from './ui/players/progress-circle.component';
import { SoundVisComponent } from './ui/sound-vis.component';

import { appReducer } from './core/app.reducer';
import { PulseService } from './pulse/pulse.service';
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
    EffectsModule.run(AudioPlayerService),
    EffectsModule.run(PulseService),
    MdButtonModule,
    MdIconModule.forRoot()
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
    ContainerComponent,
    TitleComponent,
    IntroComponent,
    PlayersComponent,
    PlayerComponent,
    AdvanceButtonComponent,
    ProgressCircleComponent,
    SoundVisComponent
  ],
  bootstrap: [ AppComponent ]
})
export class AppModule {


}
