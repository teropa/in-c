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
    this.playSample(beatSample, time);
    state.players.forEach(player => {
      const {note, gracenote, sixteenthNote} = player.nowPlaying;
      console.log(note, sixteenthNote);
      if (gracenote) {
        const sample = this.samples.getSample('piano-p', gracenote);
        this.playSample(sample, time - GRACENOTE_OFFSET);
      }
      if (note) {
        const sample = this.samples.getSample('piano-p', note);
        this.playSample(sample, time);
      }
      if (sixteenthNote) {
        const sample = this.samples.getSample('piano-p', sixteenthNote);
        this.playSample(sample, time + 60 / bpm / 2);
      }
    });
  }

  private playSample(sample: Sample, playAt: number) {
    if (!sample) {
      return;
    }
    const src = this.audioCtx.createBufferSource();
    src.buffer = sample.buffer;
    src.playbackRate.value = sample.playbackRate;
    src.connect(this.audioCtx.destination);
    src.start(playAt);
  }

}