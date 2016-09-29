import { Module } from './module.model';
import { Note } from './note.model';
import { PlayerState } from './player-state.model';

// The coordinates in visual space for a Sound. Used in visualization.
export class SoundCoordinates {
  readonly relativePitch = 0;
  readonly modulePitchExtent = 0;

  readonly relativeStart = 0;
  readonly soundDuration = 0;
  readonly moduleDuration = 0;

  constructor(fields = {}) {
    Object.assign(this, fields);
  }

  static make(playerState: PlayerState, note: Note, duration: number, fromBeat: number) {
    const mod = playerState.playlist.fromModule;
    return new SoundCoordinates({
      modulePitchExtent: mod.getMaxNoteValue() - mod.getMinNoteValue() + 1,
      relativePitch: note.getNoteValue() - mod.getMinNoteValue(),
      relativeStart: fromBeat - playerState.playlist.firstBeat - mod.getHeadingPauseDuration(),
      moduleDuration: mod.getDurationWithoutPauses(),
      soundDuration: duration
    });
  }

} 
