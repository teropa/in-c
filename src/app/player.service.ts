import { Injectable, Inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { Effect, StateUpdates } from '@ngrx/effects';
import { AppState, PlayerState, PULSE } from './app.reducer';
import { SamplesService, Sample } from './samples.service';

const GRACENOTE_OFFSET = 0.07;

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

  private playState(state: AppState, {time, bpm}: {time: number, bpm: number}) {
    const beatSample = this.samples.getSample('glockenspiel', 'c5');
    this.playSample(beatSample, time, time + 60 / bpm);
    state.players.forEach(player => {
      player.nowPlaying.forEach(({note, attackAt, releaseAt}) => {
        const sample = this.samples.getSample('piano-p', note);
        this.playSample(sample, attackAt, releaseAt);
      });
    });
  }

  private playSample(sample: Sample, attackAt: number, releaseAt: number, {vol = 1} = {}) {
    if (!sample) {
      return;
    }
    const src = this.audioCtx.createBufferSource();
    const gain = this.audioCtx.createGain();

    src.buffer = sample.buffer;
    src.playbackRate.value = sample.playbackRate;
    gain.gain.value = vol;
    gain.gain.setTargetAtTime(0, releaseAt, 0.3);

    src.connect(gain);
    gain.connect(this.audioCtx.destination);
    src.start(attackAt);
  }

}