import { Injectable, Inject } from '@angular/core';
import { Map } from 'immutable';

const SAMPLE_URLS = [
  {sample: 'glockenspiel-c5', url: require('../samples/glockenspiel-c5.mp3')}
];

// Extend TypeScript's built-in obsolete AudioContext definition
interface FixedAudioContext extends AudioContext {
  decodeAudioData(buf: ArrayBuffer): Promise<AudioBuffer>
}

@Injectable()
export class SamplesService {
  private sampleBank: Map<string, AudioBuffer> = Map.of();

  constructor(@Inject('audioCtx') private audioCtx: FixedAudioContext) {
    SAMPLE_URLS.map(({sample, url}) => this.loadSample(sample, url));
  }

  getSample(name: string) {
    return this.sampleBank.get(name);
  }

  private loadSample(sample: string, url: string) {
    return fetch(url)
      .then(res => res.arrayBuffer())
      .then(arrayBuffer => this.audioCtx.decodeAudioData(arrayBuffer))
      .then(audioBuffer => {
        this.sampleBank = this.sampleBank.set(sample, audioBuffer);
      });
  }

}