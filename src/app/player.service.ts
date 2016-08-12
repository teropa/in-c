import { Injectable, Inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { Effect, StateUpdates } from '@ngrx/effects';
import { AppState, PULSE } from './app.reducer';
import { SamplesService } from './samples.service';

@Injectable()
export class PlayerService {

  constructor(private updates$: StateUpdates<AppState>,
              private samples: SamplesService,
              @Inject('audioCtx') private audioCtx: AudioContext) {
  }

  @Effect() play$ = this.updates$
    .whenAction(PULSE)
    .do(update => this.playState(update.state, update.action.payload))
    .ignoreElements();

  private playState(state: AppState, time: number) {
    const beatBuffer = this.samples.getSample('glockenspiel-c5');
    if (beatBuffer) {
      this.playBuffer(beatBuffer, time);
    }
  }

  private playBuffer(buf: AudioBuffer, time: number) {
    const src = this.audioCtx.createBufferSource();
    src.buffer = buf;
    src.connect(this.audioCtx.destination);
    src.start(time);
  }

}