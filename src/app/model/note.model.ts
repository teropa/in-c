import { List } from 'immutable';
import { Memoize } from '../core/memoize-decorator';

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

  @Memoize
  getNoteValue() {
    const [, note, octave] = /^(\w[b\#]?)(\d)$/.exec(this.note);
    return parseInt(octave, 10) * 12 + OCTAVE.indexOf(note.toUpperCase());
  }

}

function parseNote(noteAndOctave: string): {note: string, octave: number} {
  const [, note, octave] = /^(\w[b\#]?)(\d)$/.exec(noteAndOctave);
  return {note: note.toUpperCase(), octave: parseInt(octave, 10)};
}

