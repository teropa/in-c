import { Injectable } from '@angular/core';
import { Module } from '../core/module.model';

const OCTAVE = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const MIN_BRIGHTNESS = 33;
const MAX_BRIGHTNESS = 66;

const score: any = require('json!../../score.json');

interface Note {
  note: string,
  octave: number
}

@Injectable()
export class NoteService {
  private brightnessCache = new Map<string, number>();

  getNotePositionInScale(noteAndOctave: string, moduleIdx: number) {
    const note = this.parseNote(noteAndOctave);
    const value = this.noteValue(note);
    const minValue = this.getScaleMin(moduleIdx);
    return value - minValue;    
  }

  getScaleSize(moduleIdx: number) {
    const moduleNotes: number[] = score[moduleIdx].score
      .reduce((nts: number[], note: any) => {
        if (note.note) {
          nts.push(this.noteValue(this.parseNote(note.note)));
        }
        if (note.gracenote) {
          nts.push(this.noteValue(this.parseNote(note.gracenote)));
        }
        return nts;
      }, []);
    const minNote = moduleNotes.reduce((a, b) => Math.min(a, b));
    const maxNote = moduleNotes.reduce((a, b) => Math.max(a, b));
    return (maxNote - minNote) + 1;
  }

  getScaleMin(moduleIdx: number) {
    return score[moduleIdx].score
      .reduce((nts: number[], note: any) => {
        if (note.note) {
          nts.push(this.noteValue(this.parseNote(note.note)));
        }
        if (note.gracenote) {
          nts.push(this.noteValue(this.parseNote(note.gracenote)));
        }
        return nts;
      }, [])
      .reduce((a: number, b: number) => Math.min(a, b));
  }

  private parseNote(noteAndOctave: string): Note {
    const [, note, octave] = /^(\w[b\#]?)(\d)$/.exec(noteAndOctave);
    return {note: note.toUpperCase(), octave: parseInt(octave, 10)};
  }

  private noteValue({note, octave}: Note) {
    return octave * 12 + OCTAVE.indexOf(note);
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


}