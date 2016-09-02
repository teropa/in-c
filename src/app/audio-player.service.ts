import { Injectable, Inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { Effect, StateUpdates } from '@ngrx/effects';
import { Map } from 'immutable';
import { AppState, Player, PlayerState } from './models';
import { PULSE, ADJUST_GAIN, ADJUST_PAN } from './app.reducer';
import { SamplesService, Sample } from './samples.service';

const GRACENOTE_OFFSET = 0.07;

@Injectable()
export class AudioPlayerService {

  private convolver: ConvolverNode;
  private convolverDry: GainNode;
  private convolverWet: GainNode;
  private playerPipelines: Map<Player, {gain: GainNode, pan: StereoPannerNode}> = Map.of();

  constructor(private updates$: StateUpdates<AppState>,
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
    samples.loadSample('york-minster', require('../samples/minster1_000_ortf_48k.wav')).then(buf => {
      this.convolver.buffer = buf;
    });
  }

  @Effect() play$ = this.updates$
    .whenAction(PULSE)
    .do(update => this.playState(update.state, update.action.payload))
    .ignoreElements();

  @Effect() gainAdjust$ = this.updates$
    .whenAction(ADJUST_GAIN, ADJUST_PAN)
    .do(update => this.updatePlayerPipelines(update.state))
    .ignoreElements();

  enableAudioContext() {
    const buffer = this.audioCtx.createBuffer(1, 1, 44100);
    const bufferSource = this.audioCtx.createBufferSource();
    bufferSource.buffer = buffer;
    bufferSource.connect(this.audioCtx.destination);
    bufferSource.start();
  }

  private playState(state: AppState, {time, bpm}: {time: number, bpm: number}) {
    this.playBeat(time, bpm);
    state.players.forEach(({player, nowPlaying, gainAdjust, pan}) => {
      nowPlaying.forEach(({note, attackAt, releaseAt}) => {
        const sample = this.samples.getSample(player.instrument, note);
        const pipelineNode = this.createOrUpdatePlayerPipeline(player, gainAdjust, pan);
        this.playSample(sample, attackAt, releaseAt, pipelineNode);
      });
    });
  }

  private updatePlayerPipelines(state: AppState) {
    state.players.forEach(p => this.createOrUpdatePlayerPipeline(p.player, p.gainAdjust, p.pan));
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

    gain.gain.value = maxGain;
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

  private createOrUpdatePlayerPipeline(player: Player, gainAdjust: number, panVal: number) {
    if (!this.playerPipelines.has(player)) {
      const gain = this.audioCtx.createGain();
      const pan = this.audioCtx.createStereoPanner();
      gain.connect(pan);
      this.connect(pan);
      this.playerPipelines = this.playerPipelines.set(player, {gain, pan});
    }
    const {gain, pan} = this.playerPipelines.get(player);
    gain.gain.value = player.baseGain * gainAdjust;
    pan.pan.value = panVal;
    return gain;
  }

}