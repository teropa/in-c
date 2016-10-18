import { Module, getModuleMaxNoteValue, getModuleMinNoteValue, getModuleHeadingPauseDuration, getModuleDurationWithoutPauses } from './module.model';
import { Note, getNoteValue } from './note.model';
import { PlayerState } from './player-state.model';

// The coordinates in visual space for a Sound. Used in visualization.
export interface SoundCoordinates {
  readonly relativePitch: number;
  readonly modulePitchExtent: number;

  readonly relativeStart: number;
  readonly soundDuration: number;
  readonly moduleDuration: number;
} 

export function makeSoundCoordinates(playerState: PlayerState, note: Note, duration: number, fromBeat: number): SoundCoordinates {
  const mod = playerState.playlist.fromModule;
  return {
    modulePitchExtent: getModuleMaxNoteValue(mod) - getModuleMinNoteValue(mod) + 1,
    relativePitch: getNoteValue(note) - getModuleMinNoteValue(mod),
    relativeStart: fromBeat - playerState.playlist.firstBeat - getModuleHeadingPauseDuration(mod),
    moduleDuration: getModuleDurationWithoutPauses(mod),
    soundDuration: duration
  };
}
