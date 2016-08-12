import { Injectable, Inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { Effect, StateUpdates } from '@ngrx/effects';
import { AppState, BEAT } from './app.reducer';
import { SamplesService } from './samples.service';

@Injectable()
export class PlayerService {

  constructor(private updates$: StateUpdates<AppState>,
              private samples: SamplesService,
              @Inject('audioCtx') private audioCtx: AudioContext) {
  }

  @Effect() play$ = this.updates$
    .whenAction('BEAT')
    .do(update => this.playState(update.state))
    .filter(() => false);

  private playState(state: AppState) {
    const beatBuffer = this.samples.getSample('glockenspiel-c5');
    if (beatBuffer) {
      this.playBuffer(beatBuffer);
    }
  }

  private playBuffer(buf: AudioBuffer) {
    const src = this.audioCtx.createBufferSource();
    src.buffer = buf;
    src.connect(this.audioCtx.destination);
    src.start(0);
  }

}