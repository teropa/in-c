import { List } from 'immutable';
import { Memoize } from '../core/memoize-decorator';

export const GRACENOTE_DURATION = 0.1;

const OCTAVE = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export interface Note {
  readonly note?: string;
  readonly velocity?: 'low' | 'medium' | 'high';
  readonly duration: number;
  readonly gracenote?: boolean;
}

export function getNoteValue(note: Note) {
  const [, noteOnly, octave] = /^(\w[b\#]?)(\d)$/.exec(note.note);
  return parseInt(octave, 10) * 12 + OCTAVE.indexOf(noteOnly.toUpperCase());
}
