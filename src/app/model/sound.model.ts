import { List } from 'immutable';

import { Player } from './player.model';
import { PlayerState } from './player-state.model';
import { SoundCoordinates } from './sound-coordinates.model';

// Todo: Could we just hold on to note instead of copying stuff? 
export class Sound {
  readonly instrument: string;
  readonly note: string;
  readonly velocity: 'low' | 'medium' | 'high' = 'medium';
  readonly attackAt: number;
  readonly releaseAt: number;
  
  readonly hue: number;
  readonly coordinates: SoundCoordinates;

  readonly fromPlayer: Player;

  constructor(fields = {}) {
    Object.assign(this, fields);
  }

  static make(playerState: PlayerState, time: number, note: string, velocity: string, fromOffset: number, toOffset: number, fromBeat: number, toBeat: number, hue: number) {
    return new Sound({
      instrument: playerState.player.instrument,
      note,
      velocity,
      attackAt: time + fromOffset + playerState.playlist.imperfectionDelay,
      releaseAt: time + toOffset,
      hue,
      coordinates: SoundCoordinates.make(playerState, note, toBeat - fromBeat, fromBeat),
      fromPlayer: playerState.player
    })
  }

}
