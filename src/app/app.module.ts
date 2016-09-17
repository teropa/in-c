import { NgModule, ApplicationRef } from '@angular/core';
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
import { SoundVisComponent } from './ui/sound-vis.component';
import { TopBarComponent } from './ui/top-bar.component';

import { appReducer } from './core/app.reducer';
import { PulseService } from './core/pulse.service';
import { TimeService } from './core/time.service';
import { AudioPlayerService } from './audio/audio-player.service';
import { SamplesService } from './audio/samples.service';
import { NoteService } from './ui/note.service';

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
  providers: [
    {provide: 'bpm', useValue: 220},
    AudioPlayerService,
    SamplesService,
    TimeService,
    PulseService,
    NoteService
  ],
  declarations: [
    AppComponent,
    PlayerComponent,
    SoundVisComponent,
    TopBarComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule {


}
