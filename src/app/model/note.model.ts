import { List } from 'immutable';

export const GRACENOTE_DURATION = 0.1;

const OCTAVE = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export class Note {
  readonly note?: string;
  readonly velocity?: 'low' | 'medium' | 'high' = 'medium';
  readonly duration = 0;
  readonly gracenote = false;

  constructor(fields = {}) {
    Object.assign(this, fields);
  }

  getNoteValue() {
    return noteValue(this.note);
  }

}

export function parseNote(noteAndOctave: string): {note: string, octave: number} {
  const [, note, octave] = /^(\w[b\#]?)(\d)$/.exec(noteAndOctave);
  return {note: note.toUpperCase(), octave: parseInt(octave, 10)};
}

export function noteValue(noteAndOctave: string) {
  const {note, octave} = parseNote(noteAndOctave);
  return octave * 12 + OCTAVE.indexOf(note);
}