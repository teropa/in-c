import { List } from 'immutable';

import { Note, getNoteValue } from './note.model';

export interface Module {
  readonly number: number;
  readonly score: List<Note>;
  readonly changeHue?: boolean;
  readonly hue: number;
}

export function getModuleDuration(mod: Module) {
  return mod.score.reduce((sum, n) => sum + n.duration, 0);
}

export function getModuleDurationWithoutPauses(mod: Module) {
  return getModuleDuration(mod) -
    getModuleHeadingPauseDuration(mod) -
    getModuleTrailingPauseDuration(mod);
}

export function getModuleHeadingPauseDuration(mod: Module) {
  return mod.score
    .takeWhile(n => !n.note)
    .reduce((sum, n) => sum + n.duration, 0);
}

export function getModuleTrailingPauseDuration(mod: Module) {
  return mod.score
    .reverse()
    .takeWhile(n => !n.note)
    .reduce((sum, n) => sum + n.duration, 0);
}

export function getModuleMinNoteValue(mod: Module) {
  return mod.score
    .filter(n => !!n.note)
    .map(getNoteValue)
    .min();
}

export function getModuleMaxNoteValue(mod: Module) {
  return mod.score
    .filter(n => !!n.note)
    .map(getNoteValue)
    .max();
}


