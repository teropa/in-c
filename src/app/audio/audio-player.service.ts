import { Injectable, Inject, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { Store } from '@ngrx/store';
import { Effect, Actions, mergeEffects } from '@ngrx/effects';
import { Map } from 'immutable';

import { AppState } from '../core/app-state.model';
import { Player } from '../core/player.model';
import { PlayerState } from '../core/player-state.model';
import { PULSE, ADJUST_PAN, ADJUST_GAIN } from '../core/actions';
import { SamplesService, Sample } from './samples.service';

const GRACENOTE_OFFSET = 0.07;

@Injectable()
export class AudioPlayerService implements OnDestroy {
  private subscription: Subscription;
  private convolver: ConvolverNode;
  private convolverDry: GainNode;
  private convolverWet: GainNode;
  private playerPipelines: Map<string, {baseGain: GainNode, gain: GainNode, pan: StereoPannerNode}> = Map.of();

  constructor(private actions$: Actions,
              private store$: Store<AppState>,
              private samples: SamplesService,
              @Inject('audioCtx') private audioCtx: AudioContext) {
    this.convolver = audioCtx.createConvolver();
    this.convolverDry = audioCtx.createGain();
    this.convolverWet = audioCtx.createGain();
    this.convolverDry.gain.value = 0.8;
    this.convolverWet.gain.value = 0.2;
    this.convolver.connect(this.convolverWet);
    this.convolverDry.connect(audioCtx.destination);
    this.convolverWet.connect(audioCtx.destination);
    samples.loadSample(require('../../samples/minster1_000_ortf_48k.wav')).then(buf => {
      this.convolver.buffer = buf;
    });
    this.subscription = mergeEffects(this).subscribe(store$);
  }

  @Effect({dispatch: false}) play$ = this.actions$
    .ofType(PULSE)
    .withLatestFrom(this.store$)
    .do(([action, state]) => this.playState(state, action.payload));

  @Effect({dispatch: false}) paramAdjust$ = this.actions$
    .ofType(ADJUST_PAN, ADJUST_GAIN)
    .withLatestFrom(this.store$)
    .do(([_, state]) => this.updatePlayerPipelines(state));

  enableAudioContext() {
    const buffer = this.audioCtx.createBuffer(1, 1, 44100);
    const bufferSource = this.audioCtx.createBufferSource();
    bufferSource.buffer = buffer;
    bufferSource.connect(this.audioCtx.destination);
    bufferSource.start();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
  
  private playState(state: AppState, {time, bpm}: {time: number, bpm: number}) {
    this.playBeat(time, bpm);
    state.nowPlaying.forEach(({instrument, note, velocity, attackAt, releaseAt, playerState}) => {
      const sample = this.samples.getSample(instrument, note, velocity);
      const pipelineNode = this.createOrUpdatePlayerPipeline(instrument, playerState.player.baseGain, playerState.gain, playerState.pan);
      this.playSample(sample, attackAt, releaseAt, pipelineNode);
    });
  }

  private updatePlayerPipelines(state: AppState) {
    state.players.forEach(p => this.createOrUpdatePlayerPipeline(p.player.instrument, p.player.baseGain, p.gain, p.pan));
  }

  private playBeat(time: number, bpm: number) {
    const duration = 0.15;
    const maxGain = 0.05;

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    const echoDelay = this.audioCtx.createDelay(0.1);
    const echoGain = this.audioCtx.createGain();

    osc.frequency.value = 440 * Math.pow(2, 3/12);

    osc.connect(gain);
    this.connect(gain)

    osc.start(time);
    osc.stop(time + duration);

    gain.gain.setValueAtTime(maxGain, time);
    gain.gain.linearRampToValueAtTime(0, time + duration);
  }

  private playSample(sample: Sample, attackAt: number, releaseAt: number, next: AudioNode) {
    if (!sample) {
      return;
    }
    const src = this.audioCtx.createBufferSource();
    const gain = this.audioCtx.createGain();

    src.buffer = sample.buffer;
    gain.gain.value = 1;
    gain.gain.setValueAtTime(0, attackAt);
    gain.gain.linearRampToValueAtTime(1, attackAt + 0.003);
    gain.gain.setTargetAtTime(0, releaseAt, 0.3);

    src.connect(gain);
    gain.connect(next);

    src.start(attackAt, sample.startPosition);
    src.stop(attackAt + (sample.endPosition - sample.startPosition));
  }

  private connect(node: AudioNode) {
    node.connect(this.convolverDry);
    node.connect(this.convolver);
  }

  private createOrUpdatePlayerPipeline(instrument: string, baseGainVal: number, gainVal: number, panVal: number) {
    if (!this.playerPipelines.has(instrument)) {
      const baseGain = this.audioCtx.createGain();
      const gain = this.audioCtx.createGain();
      const pan = this.audioCtx.createStereoPanner();
      baseGain.connect(gain);
      gain.connect(pan);
      this.connect(pan);
      this.playerPipelines = this.playerPipelines.set(instrument, {baseGain, gain, pan});
    }
    const {baseGain, gain, pan} = this.playerPipelines.get(instrument);
    baseGain.gain.value = baseGainVal;
    gain.gain.value = gainVal;
    pan.pan.value = panVal;
    return baseGain;
  }

}