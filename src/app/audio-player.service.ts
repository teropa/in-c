import { Injectable, Inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { Effect, StateUpdates } from '@ngrx/effects';
import { AppState, PlayerState } from './models';
import { PULSE } from './app.reducer';
import { SamplesService, Sample } from './samples.service';

const GRACENOTE_OFFSET = 0.07;

@Injectable()
export class AudioPlayerService {

  private convolver: ConvolverNode;
  private dry: GainNode;
  private wet: GainNode;

  constructor(private updates$: StateUpdates<AppState>,
              private samples: SamplesService,
              @Inject('audioCtx') private audioCtx: AudioContext) {
    this.convolver = audioCtx.createConvolver();
    this.dry = audioCtx.createGain();
    this.wet = audioCtx.createGain();
    this.dry.gain.value = 0.8;
    this.wet.gain.value = 0.2;
    this.convolver.connect(this.wet);
    this.dry.connect(audioCtx.destination);
    this.wet.connect(audioCtx.destination);
    samples.loadSample('york-minster', require('../samples/minster1_000_ortf_48k.wav')).then(buf => {
      this.convolver.buffer = buf;
    });
  }

  @Effect() play$ = this.updates$
    .whenAction(PULSE)
    .do(update => this.playState(update.state, update.action.payload))
    .ignoreElements();

  private playState(state: AppState, {time, bpm}: {time: number, bpm: number}) {
    this.playBeat(time, bpm);
    state.players.forEach(player => {
      player.nowPlaying.forEach(({note, attackAt, releaseAt, player: {instrument, position, gain}}) => {
        const sample = this.samples.getSample(instrument, note);
        this.playSample(sample, attackAt, releaseAt, position, gain);
      });
    });
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

  private playSample(sample: Sample, attackAt: number, releaseAt: number, pan: number = 0, vol = 1) {
    if (!sample) {
      return;
    }
    const src = this.audioCtx.createBufferSource();
    const gain = this.audioCtx.createGain();
    const panner = this.audioCtx.createStereoPanner();

    src.buffer = sample.buffer;
    gain.gain.value = vol;
    gain.gain.setValueAtTime(0, attackAt);
    gain.gain.linearRampToValueAtTime(vol, attackAt + 0.003);
    gain.gain.setTargetAtTime(0, releaseAt, 0.3);
    panner.pan.value = pan;

    src.connect(gain);
    gain.connect(panner);
    this.connect(panner);

    src.start(attackAt, sample.startPosition);
    src.stop(attackAt + (sample.endPosition - sample.startPosition));
  }

  private connect(node: AudioNode) {
    node.connect(this.dry);
    node.connect(this.convolver);
  }

}