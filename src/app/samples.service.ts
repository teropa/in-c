import { Injectable, Inject } from '@angular/core';
import { Map } from 'immutable';

const SAMPLE_URLS = [
  {sample: 'glockenspiel-c5', url: require('../samples/glockenspiel-c5.mp3')},
  {sample: 'piano-p-c4', url: require('../samples/piano-p-c4.mp3')},
  {sample: 'piano-p-d#4', url: require('../samples/piano-p-ds4.mp3')},
  {sample: 'piano-p-d#5', url: require('../samples/piano-p-ds5.mp3')},
  {sample: 'piano-p-f#4', url: require('../samples/piano-p-fs4.mp3')},
  {sample: 'piano-p-c5', url: require('../samples/piano-p-c5.mp3')},
  {sample: 'piano-p-f#5', url: require('../samples/piano-p-fs5.mp3')},
  {sample: 'piano-p-f#3', url: require('../samples/piano-p-fs3.mp3')},
  {sample: 'piano-p-a4', url: require('../samples/piano-p-a4.mp3')},
  {sample: 'piano-p-a5', url: require('../samples/piano-p-a5.mp3')},
  {sample: 'piano-p-c6', url: require('../samples/piano-p-c6.mp3')}

];

// Extend TypeScript's built-in obsolete AudioContext definition
interface FixedAudioContext extends AudioContext {
  decodeAudioData(buf: ArrayBuffer): Promise<AudioBuffer>
}

export interface Sample {
  buffer: AudioBuffer,
  playbackRate: number
}

@Injectable()
export class SamplesService {
  private sampleBank: Map<string, AudioBuffer> = Map.of();

  constructor(@Inject('audioCtx') private audioCtx: FixedAudioContext) {
    SAMPLE_URLS.map(({sample, url}) => this.loadSample(sample, url));
  }

  getSample(instrument: string, note: string): Sample {
    note = note.toLowerCase();
    let playbackRate = 1;
    if (note === 'e4') {
      note = 'd#4';
      playbackRate = Math.pow(2, 1/12);
    } else if (note === 'e5') {
      note = 'd#5';
      playbackRate = Math.pow(2, 1/12);
    } else if (note === 'd5') {
      note = 'd#5';
      playbackRate = Math.pow(2, -1/12);
    } else if (note === 'f4') {
      note = 'f#4';
      playbackRate = Math.pow(2, -1/12);
    } else if (note === 'f5') {
      note = 'f#5';
      playbackRate = Math.pow(2, -1/12);
    } else if (note === 'g4') {
      note = 'f#4';
      playbackRate = Math.pow(2, 1/12);
    } else if (note === 'b4') {
      note = 'c5';
      playbackRate = Math.pow(2, -1/12);
    } else if (note === 'g5') {
      note = 'f#5';
      playbackRate = Math.pow(2, 1/12);
    } else if (note === 'g3') {
      note = 'f#3';
      playbackRate = Math.pow(2, 1/12);
    } else if (note === 'bb4') {
      note = 'a4';
      playbackRate = Math.pow(2, 1/12);
    } else if (note === 'b5') {
      note = 'c6';
      playbackRate = Math.pow(2, -2/12);
    }
    if (this.sampleBank.has(`${instrument}-${note}`)) {
      return {
        buffer: this.sampleBank.get(`${instrument}-${note}`),
        playbackRate
      }
    }
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