import { List } from 'immutable';
import { TypedRecord, makeTypedFactory } from 'typed-immutable-record';

const OCTAVE = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export interface Note {
  note: string,
  velocity: string,
  duration: number,
  gracenote?: string
}

export interface NoteRecord extends TypedRecord<NoteRecord>, Note {}
export const noteFactory = makeTypedFactory<Note, NoteRecord>({
  note: null,
  velocity: 'medium',
  duration: 1,
  gracenote: null
});

export function parseNote(noteAndOctave: string): {note: string, octave: number} {
  const [, note, octave] = /^(\w[b\#]?)(\d)$/.exec(noteAndOctave);
  return {note: note.toUpperCase(), octave: parseInt(octave, 10)};
}

export function noteValue(noteAndOctave: string) {
  const {note, octave} = parseNote(noteAndOctave);
  return octave * 12 + OCTAVE.indexOf(note);
}