import { Injectable, Inject } from '@angular/core';
import { Map } from 'immutable';

// Extend TypeScript's built-in obsolete AudioContext definition
interface FixedAudioContext extends AudioContext {
  decodeAudioData(buf: ArrayBuffer): Promise<AudioBuffer>
}

export interface Sample {
  buffer: AudioBuffer,
  playbackRate: number
}

interface SampleBankItem {
  note: string;
  octave: number;
  url: string
}


const SAMPLE_URLS: {[instrument: string]: SampleBankItem[]} = {
  'glockenspiel': [
    {note: 'c', octave: 5, url: require('../samples/glockenspiel-c5.mp3')},
  ],
  'piano-p': [
    {note: 'c',  octave: 4, url: require('../samples/piano-p-c4.mp3')},
    {note: 'd#', octave: 4, url: require('../samples/piano-p-ds4.mp3')},
    {note: 'd#', octave: 5, url: require('../samples/piano-p-ds5.mp3')},
    {note: 'f#', octave: 4, url: require('../samples/piano-p-fs4.mp3')},
    {note: 'c',  octave: 5, url: require('../samples/piano-p-c5.mp3')},
    {note: 'f#', octave: 5, url: require('../samples/piano-p-fs5.mp3')},
    {note: 'f#', octave: 3, url: require('../samples/piano-p-fs3.mp3')},
    {note: 'a',  octave: 4, url: require('../samples/piano-p-a4.mp3')},
    {note: 'a',  octave: 5, url: require('../samples/piano-p-a5.mp3')},
    {note: 'c',  octave: 6, url: require('../samples/piano-p-c6.mp3')}
  ]
};

const OCTAVE = ['c', 'c#', 'd', 'd#', 'e', 'f', 'f#', 'g', 'g#', 'a', 'a#', 'b'];

function noteValue(note: string, octave: number) {
  return octave * 12 + OCTAVE.indexOf(note);
}

function getNoteDistance(note1: string, octave1: number, note2: string, octave2: number) {
  return noteValue(note1, octave1) - noteValue(note2, octave2);
}

function getNearestSample(sampleBank:{note: string, octave: number, url: string}[], note: string, octave: number) {
  let sortedBank = sampleBank.slice().sort((sampleA, sampleB) => {
    let distanceToA =
      Math.abs(getNoteDistance(note, octave, sampleA.note, sampleA.octave));
    let distanceToB =
      Math.abs(getNoteDistance(note, octave, sampleB.note, sampleB.octave));
    return distanceToA - distanceToB;
  });
  return sortedBank[0];
}


@Injectable()
export class SamplesService {
  private sampleBank: Map<string, Map<string, Map<number, AudioBuffer>>> = Map.of();

  constructor(@Inject('audioCtx') private audioCtx: FixedAudioContext) {
    Object.keys(SAMPLE_URLS).forEach(instrument => {
      SAMPLE_URLS[instrument].map(item => this.loadSample(instrument, item));
    })
  }

  getSample(instrument: string, noteAndOctave: string): Sample {
    let [, note, octaveS] = /^(\w[b#]?)(\d)$/.exec(noteAndOctave.toLowerCase());
    note = this.flatToSharp(note);
    let octave = parseInt(octaveS, 10);

    let sampleBank = SAMPLE_URLS[instrument];
    let sample = getNearestSample(sampleBank, note, octave);
    let distance =
      getNoteDistance(note, octave, sample.note, sample.octave);
    
    if (this.sampleBank.hasIn([instrument, sample.note, sample.octave])) {
      return {
        buffer: this.sampleBank.getIn([instrument, sample.note, sample.octave]),
        playbackRate: Math.pow(2, distance/12) 
      }
    }
  }

  private flatToSharp(note: string) {
    switch (note) {
      case 'Bb': return 'A#';
      case 'Db': return 'C#';
      case 'Eb': return 'D#';
      case 'Gb': return 'F#';
      case 'Ab': return 'G#';
      default:   return note;
    }
  }

  private loadSample(instrument: string, {note, octave, url}: SampleBankItem) {
    return fetch(url)
      .then(res => res.arrayBuffer())
      .then(arrayBuffer => this.audioCtx.decodeAudioData(arrayBuffer))
      .then(audioBuffer => {
        this.sampleBank = this.sampleBank.setIn([instrument, note, octave], audioBuffer);
      });
  }

}