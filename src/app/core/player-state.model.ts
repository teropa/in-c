import { List } from 'immutable';
import { TypedRecord, makeTypedFactory } from 'typed-immutable-record';

import { PlayerRecord, playerFactory } from './player.model';
import { PlaylistRecord } from './playlist.model';
import { PlaylistItemRecord } from './playlist-item.model';

export interface PlayerState {
  player: PlayerRecord;
  moduleIndex?: number;
  progress?: number;
  advanceFactor: number;
  playlist?: PlaylistRecord;
  pan: number;
  gain: number;
}

export interface PlayerStateRecord extends TypedRecord<PlayerStateRecord>, PlayerState {}

export const playerStateFactory = makeTypedFactory<PlayerState, PlayerStateRecord>({
  player: playerFactory(),
  moduleIndex: null,
  progress: 0,
  advanceFactor: 1,
  playlist: null,
  pan: 0,
  gain: 0.75
});

