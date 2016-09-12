import { List } from 'immutable';
import { TypedRecord, makeTypedFactory } from 'typed-immutable-record';

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
