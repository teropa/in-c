import { List } from 'immutable';
import { TypedRecord, makeTypedFactory } from 'typed-immutable-record';

import { PlayerRecord, playerFactory } from './player.model';
import { PlaylistRecord } from './playlist.model';
import { PlaylistItemRecord } from './playlist-item.model';
import { SoundRecord } from './sound.model';

export interface PlayerState {
  player: PlayerRecord;
  moduleIndex?: number;
  progress?: number;
  playlist?: PlaylistRecord;
  nowPlaying: List<SoundRecord>;
  pan: number;
  gain: number;
}

export interface PlayerStateRecord extends TypedRecord<PlayerStateRecord>, PlayerState {}

export const playerStateFactory = makeTypedFactory<PlayerState, PlayerStateRecord>({
  player: playerFactory(),
  moduleIndex: null,
  progress: 0,
  playlist: null,
  nowPlaying: <List<SoundRecord>>List.of(),
  pan: 0,
  gain: 0.75
});

