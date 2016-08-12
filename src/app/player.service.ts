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

  private playState(state: AppState, time: number) {
    const beatSample = this.samples.getSample('glockenspiel', 'c5');
    if (beatSample) {
      this.playSample(beatSample, time);
    }
    state.players.forEach(player => {
      player.nowPlaying.reverse().forEach((note, idx) => {
        const timeOffset = idx * GRACENOTE_OFFSET; 
        const sample = this.samples.getSample('piano-p', note);
        if (sample) {
          this.playSample(sample, time - timeOffset);
        }
      });
    });
  }

  private playSample(sample: Sample, playAt: number) {
    const src = this.audioCtx.createBufferSource();
    src.buffer = sample.buffer;
    src.playbackRate.value = sample.playbackRate;
    src.connect(this.audioCtx.destination);
    src.start(playAt);
  }

}