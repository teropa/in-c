import { List } from 'immutable';
import { PlayerState } from './player-state.model';

export interface PlayerStats {
  readonly minModuleIndex: number;
  readonly maxModuleIndex: number;
  readonly playerCount: number;
  readonly totalProgress: number;
}

export function updatePlayerStats(stats: PlayerStats, players: List<PlayerState>) {
  const mods = players.map(p => p.moduleIndex);
  const totalProgress = players.map(p => p.progress).reduce((s, p) => s + p, 0) / players.size;
  return Object.assign({}, stats, {
    minModuleIndex: mods.min(),
    maxModuleIndex: mods.max(),
    totalProgress
  });
}
