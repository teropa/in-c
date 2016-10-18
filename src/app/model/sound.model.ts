import { List } from 'immutable';

import { Note } from './note.model';
import { Player } from './player.model';
import { PlayerState } from './player-state.model';
import { SoundCoordinates, makeSoundCoordinates } from './sound-coordinates.model';

export interface Sound {
  readonly instrument: string;
  readonly note: Note;
  readonly attackAt: number;
  readonly releaseAt: number;
  
  readonly hue: number;
  readonly coordinates: SoundCoordinates;

  readonly fromPlayer: Player;
}

export function makeSound(playerState: PlayerState, time: number, note: Note, fromOffset: number, toOffset: number, fromBeat: number, toBeat: number, hue: number): Sound {
  return {
    instrument: playerState.player.instrument,
    note,
    attackAt: time + fromOffset + playerState.playlist.imperfectionDelay,
    releaseAt: time + toOffset,
    hue,
    coordinates: makeSoundCoordinates(playerState, note, toBeat - fromBeat, fromBeat),
    fromPlayer: playerState.player
  };
}
