import { Injectable, Inject } from '@angular/core';

export interface Sample {
  buffer: AudioBuffer,
  startPosition: number,
  endPosition: number
}

export const NOTES = {
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
};
export const VELOCITY_OFFSETS = {
  'low': 0,
  'medium': 68,
  'high': 136
};


@Injectable()
export class SamplesService {

  constructor(@Inject('samples') private samples: Map<string, AudioBuffer>,
              @Inject('samplesLoaded') public samplesLoaded: Promise<boolean>) {
  }

  getSampleBuffer(key: string) {
    return this.samples.get(key);
  }

  getNoteSample(key: string, noteAndOctave: string, velocity = 'medium'): Sample {
    let soundfont = this.samples.get(key);
    if (soundfont) {
      return {
        buffer: soundfont,
        startPosition: VELOCITY_OFFSETS[velocity] + NOTES[noteAndOctave][0],
        endPosition: VELOCITY_OFFSETS[velocity] + NOTES[noteAndOctave][1]
      };
    } else {
      return null;
    }
  }

}