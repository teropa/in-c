import { List } from 'immutable';

import { Note } from './note.model';
import { Player } from './player.model';
import { PlayerState } from './player-state.model';
import { SoundCoordinates } from './sound-coordinates.model';

export class Sound {
  readonly instrument: string;
  readonly note: Note;
  readonly attackAt: number;
  readonly releaseAt: number;
  
  readonly hue: number;
  readonly coordinates: SoundCoordinates;

  readonly fromPlayer: Player;

  constructor(fields = {}) {
    Object.assign(this, fields);
  }

  static make(playerState: PlayerState, time: number, note: Note, fromOffset: number, toOffset: number, fromBeat: number, toBeat: number, hue: number) {
    return new Sound({
      instrument: playerState.player.instrument,
      note,
      attackAt: time + fromOffset + playerState.playlist.imperfectionDelay,
      releaseAt: time + toOffset,
      hue,
      coordinates: SoundCoordinates.make(playerState, note, toBeat - fromBeat, fromBeat),
      fromPlayer: playerState.player
    })
  }

}
