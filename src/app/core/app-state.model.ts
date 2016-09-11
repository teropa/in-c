import { List } from 'immutable';
import { TypedRecord, makeTypedFactory } from 'typed-immutable-record';

import { ModuleRecord } from './module.model';
import { PlayerStateRecord } from './player-state.model';
import { PlayerStatsRecord } from './player-stats.model';
import { SoundRecord } from './sound.model';

export interface AppState {
  score: List<ModuleRecord>,
  beat: number;
  players: List<PlayerStateRecord>,
  stats: PlayerStatsRecord,
  nowPlaying: List<SoundRecord>,
  paused: boolean
}

export interface AppStateRecord extends TypedRecord<AppStateRecord>, AppState {}
export const appStateFactory = makeTypedFactory<AppState, AppStateRecord>({
  score: null,
  beat: -1,
  players: null,
  stats: null,
  nowPlaying: <List<SoundRecord>>List.of(),
  paused: false
});

