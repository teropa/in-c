import { List } from 'immutable';
import { TypedRecord, makeTypedFactory } from 'typed-immutable-record';

import { NoteRecord } from './note.model';

export interface Module {
  number: number,
  score: List<NoteRecord>,
  changeHue?: boolean,
  hue: number
}

export interface ModuleRecord extends TypedRecord<ModuleRecord>, Module {}
export const moduleFactory = makeTypedFactory<Module, ModuleRecord>({
  number: -1,
  score: <List<NoteRecord>>List.of(),
  hue: 0
});