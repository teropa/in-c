import { List } from 'immutable';
import { TypedRecord, makeTypedFactory } from 'typed-immutable-record';

import { NoteRecord } from './note.model';

export interface Module {
  number: number,
  score: List<NoteRecord>,
  minNoteValue: number,
  maxNoteValue: number,
  changeHue?: boolean,
  hue: number
}

export interface ModuleRecord extends TypedRecord<ModuleRecord>, Module {}
export const moduleFactory = makeTypedFactory<Module, ModuleRecord>({
  number: -1,
  score: <List<NoteRecord>>List.of(),
  minNoteValue: 0,
  maxNoteValue: 0,
  hue: 0
});

export function moduleDuration(mod: ModuleRecord) {
  return mod.score.reduce((sum, n) => sum + n.duration, 0)
}

export function moduleDurationWithoutPauses(mod: ModuleRecord) {
  return moduleDuration(mod) - headingPauseDuration(mod) - trailingPauseDuration(mod);
}

export function headingPauseDuration(mod: ModuleRecord) {
  return mod.score
    .takeWhile(n => !n.note)
    .reduce((sum, n) => sum + n.duration, 0);
}

export function trailingPauseDuration(mod: ModuleRecord) {
  return mod.score
    .reverse()
    .takeWhile(n => !n.note)
    .reduce((sum, n) => sum + n.duration, 0);
}

