import { List } from 'immutable';
import { TypedRecord, makeTypedFactory } from 'typed-immutable-record';

export interface PlayerStats {
  minModuleIndex: number;
  maxModuleIndex: number;
  playerCount: number;
}

export interface PlayerStatsRecord extends TypedRecord<PlayerStatsRecord>, PlayerStats {}
export const playerStatsFactory = makeTypedFactory<PlayerStats, PlayerStatsRecord>({
  minModuleIndex: null,
  maxModuleIndex: null,
  playerCount: 0
});
