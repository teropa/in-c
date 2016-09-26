import { List } from 'immutable';
import { AppStateRecord } from '../model/app-state.model';
import { ModuleRecord } from '../model/module.model';
import { PlayerStateRecord } from '../model/player-state.model';
import { PlayerStatsRecord } from '../model/player-stats.model';

export function advance(state: AppStateRecord, instrument: string) {
  const playerIdx = state.players.findIndex(p => p.player.instrument === instrument);
  const {score, stats} = state;
  const playerState = state.players.get(playerIdx)
  if (playerState.moduleIndex === score.size - 1) {
    const players = state.players
      .update(playerIdx, player => player.merge({finished: true}));
    return updatePlayerStats(state.merge({players}));
  } else if (canAdvance(state.players.get(playerIdx), state.stats)) {
    const players = state.players
      .update(playerIdx, player => assignModule(player, score, stats));
    return updatePlayerStats(state.merge({players}));
  } else {
    return state;
  }
}

function canAdvance(playerState: PlayerStateRecord, playerStats: PlayerStatsRecord) {
  const isFarAhead = playerState.moduleIndex - playerStats.minModuleIndex >= 2;
  return !playerState.finished && !isFarAhead;
}

function assignModule(playerState: PlayerStateRecord, score: List<ModuleRecord>, playerStats: PlayerStatsRecord) {
  return playerState.merge({
    moduleIndex: playerState.moduleIndex + 1,
    progress: (playerState.moduleIndex + 2) / score.size * 100
  });
}

function updatePlayerStats(state: AppStateRecord) {
  const mods = state.players.map(p => p.moduleIndex);
  const totalProgress = state.players.map(p => p.progress).reduce((s, p) => s + p, 0) / state.players.size;
  const stats = state.stats.merge({
    minModuleIndex: mods.min(),
    maxModuleIndex: mods.max(),
    totalProgress
  });
  const players = state.players.map(p => p.merge({canAdvance: canAdvance(p, stats)}));
  return state.merge({stats, players});
}




