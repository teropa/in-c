import { Injectable, Inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { Effect, StateUpdates } from '@ngrx/effects';
import { AppState, PlayerState } from './models';
import { PULSE } from './app.reducer';
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
    this.playBeat(time, bpm);
    state.players.forEach(player => {
      player.nowPlaying.forEach(({note, attackAt, releaseAt, player: {instrument, position, gain, octaveShift}}) => {
        const sample = this.samples.getSample(instrument, note, octaveShift);
        this.playSample(sample, attackAt, releaseAt, position, gain);
      });
    });
  }

  private playBeat(time: number, bpm: number) {
    const duration = 0.1;
    const maxGain = 0.1;

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    const echoDelay = this.audioCtx.createDelay(0.1);
    const echoGain = this.audioCtx.createGain();

    osc.frequency.value = 440 * Math.pow(2, 3/12);
    echoDelay.delayTime.value = 0.02;
    echoGain.gain.value = 0.7;

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);
    gain.connect(echoDelay);
    echoDelay.connect(this.audioCtx.destination);
    echoDelay.connect(echoGain);
    echoGain.connect(echoDelay);

    osc.start(time);
    osc.stop(time + duration);

    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(maxGain, time + 0.003);
    gain.gain.setValueAtTime(maxGain, time + duration - 0.003);
    gain.gain.linearRampToValueAtTime(0, time + duration);
  }

  private playSample(sample: Sample, attackAt: number, releaseAt: number, pan: number = 0, vol = 1) {
    if (!sample) {
      return;
    }
    const src = this.audioCtx.createBufferSource();
    const gain = this.audioCtx.createGain();
    const panner = this.audioCtx.createStereoPanner();

    src.buffer = sample.buffer;
    src.playbackRate.value = sample.playbackRate;
    gain.gain.value = vol;
    gain.gain.setTargetAtTime(0, releaseAt, 0.3);
    panner.pan.value = pan;

    src.connect(gain);
    gain.connect(panner);
    panner.connect(this.audioCtx.destination);

    src.start(attackAt);
  }

}