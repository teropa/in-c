import { Injectable, Inject } from '@angular/core';
import { Map } from 'immutable';

// Extend TypeScript's built-in obsolete AudioContext definition
interface FixedAudioContext extends AudioContext {
  decodeAudioData(buf: ArrayBuffer): Promise<AudioBuffer>
}

export interface Sample {
  buffer: AudioBuffer,
  startPosition: number,
  endPosition: number
}


const NOTE_OFFSETS = {
  'G3': [0, 4],
  'C4': [4, 8],
  'E4': [8, 12],
  'F4': [12, 16],
  'F#4': [16, 20],
  'G4': [20, 24],
  'A4': [24, 28],
  'Bb4': [28, 32],
  'B4': [32, 36],
  'C5': [36, 40],
  'D5': [40, 44],
  'E5': [44, 48],
  'F5': [48, 52],
  'F#5': [52, 56],
  'G5': [56, 60],
  'A5': [60, 64],
  'B5': [64, 68]
}
const SOUNDFONT_URLS = {
  'boxy-synth-bass': require('../soundfonts/boxy-synth-bass-mono.mp3'),
  'deep-synth-bass': require('../soundfonts/deep-synth-bass-mono.mp3'),
  'delicate-bells': require('../soundfonts/delicate-bells-mono.mp3'),
  'dream-dancer': require('../soundfonts/dream-dancer-mono.mp3'),
  'dreamy-bells': require('../soundfonts/dreamy-bells-mono.mp3'),
  'eighties-pop-bass': require('../soundfonts/eighties-pop-bass-mono.mp3'),
  'fm-piano': require('../soundfonts/fm-piano-mono.mp3'),
  'gnarly-trance-pluck': require('../soundfonts/gnarly-trance-pluck.mp3'),
  'gnarly-trance-pluck-high': require('../soundfonts/gnarly-trance-pluck-high.mp3'),
  'hard-tech-bass': require('../soundfonts/hard-tech-bass-mono.mp3'),
  'mellow-chimes': require('../soundfonts/mellow-chimes-mono.mp3'),
  'metro-bass': require('../soundfonts/metro-bass-mono.mp3'),
  'micro-pulse': require('../soundfonts/micro-pulse-mono.mp3'),
  'neon-synth-bass': require('../soundfonts/neon-synth-bass-mono.mp3'),
  'raining-bells': require('../soundfonts/raining-bells-mono.mp3'),
  'rising-waves': require('../soundfonts/rising-waves-mono.mp3'),
  'soft-synth-bells': require('../soundfonts/soft-synth-bells-mono.mp3'),
  'synthetic-marimba': require('../soundfonts/synthetic-marimba-mono.mp3'),
  'synthetic-marimba-low': require('../soundfonts/synthetic-marimba-low-mono.mp3'),
  'synthetic-voice': require('../soundfonts/synthetic-voice-mono.mp3'),
  'tight-synth-bass': require('../soundfonts/tight-synth-bass-mono.mp3'),
  'upright-studio-bass': require('../soundfonts/upright-studio-bass-mono.mp3'),
  'vintage-computer': require('../soundfonts/vintage-computer-mono.mp3'),
  'vintage-funk': require('../soundfonts/vintage-funk-mono.mp3')
};

@Injectable()
export class SamplesService {
  private soundBank: Map<string, AudioBuffer> = Map.of();

  constructor(@Inject('audioCtx') private audioCtx: FixedAudioContext) {
    Object.keys(SOUNDFONT_URLS).forEach(instrument => {
      this.loadSample(instrument, SOUNDFONT_URLS[instrument]);
    })
  }

  getSample(instrument: string, noteAndOctave: string): Sample {
    let soundfont = this.soundBank.get(instrument);
    if (soundfont) {
      return {
        buffer: soundfont,
        startPosition: NOTE_OFFSETS[noteAndOctave][0],
        endPosition: NOTE_OFFSETS[noteAndOctave][1]
      };
    }
  }


  private loadSample(instrument: string, url: string) {
    return fetch(url)
      .then(res => res.arrayBuffer())
      .then(arrayBuffer => this.audioCtx.decodeAudioData(arrayBuffer))
      .then(audioBuffer => {
        this.soundBank = this.soundBank.set(instrument, audioBuffer);
      });
  }

}