import { Module } from './module.model';
import { noteValue } from './note.model';
import { PlayerState } from './player-state.model';

export class SoundCoordinates {
  readonly relativePitch = 0;
  readonly modulePitchExtent = 0;

  readonly relativeStart = 0;
  readonly soundDuration = 0;
  readonly moduleDuration = 0;

  constructor(fields = {}) {
    Object.assign(this, fields);
  }

  static make(playerState: PlayerState, note: string, duration: number, fromBeat: number) {
    const mod = playerState.playlist.fromModule;
    return new SoundCoordinates({
      modulePitchExtent: mod.maxNoteValue - mod.minNoteValue + 1,
      relativePitch: noteValue(note) - mod.minNoteValue,
      relativeStart: fromBeat - playerState.playlist.firstBeat - mod.getHeadingPauseDuration(),
      moduleDuration: mod.getDurationWithoutPauses(),
      soundDuration: duration
    });
  }

} 
