import { List } from 'immutable';

import { Module } from './module.model';
import { PlayerState, advancePlayerState, assignScreensaverModuleToPlayer, getPlayerNowPlaying, initPlayerState, updatePlayerPlaylist } from './player-state.model';
import { PlayerStats, updatePlayerStats } from './player-stats.model';
import { Sound } from './sound.model';

export interface AppState {
  readonly playing: boolean;
  readonly score: List<Module>;
  readonly beat: number;
  readonly players: List<PlayerState>;
  readonly stats: PlayerStats;
  readonly nowPlaying: List<Sound>;
}

export function areAllFinished(state: AppState) {
  return state.players.every(p => p.finished);
}

export function play(state: AppState): AppState {
  return Object.assign({}, state, {
    playing: true,
    nowPlaying: List<Sound>(),
    players: state.players.map(initPlayerState)
  });
}

export function advancePlayer(state: AppState, instrument: string): AppState {
  const playerIdx = state.players.findIndex(p => p.player.instrument === instrument);
  const newPlayers = state.players.update(playerIdx, (p: PlayerState) => advancePlayerState(p, state.score, state.stats));
  return Object.assign({}, state, {
    players: newPlayers,
    stats: updatePlayerStats(state.stats, newPlayers)
  });
}

export function pulse(state: AppState, time: number, bpm: number): AppState {
  const nextBeat = state.beat + 1;
  const updatedPlayerStates = state.players
    .map(playerState => {
      if (!state.playing) {
        playerState = assignScreensaverModuleToPlayer(playerState, nextBeat, state.score.size);
      }
      return updatePlayerPlaylist(playerState, state.score, nextBeat, bpm)
    });           
  const nowPlaying = getNowPlaying(state, time, bpm);
  return Object.assign({}, state, {
    players: updatedPlayerStates,
    nowPlaying,
    beat: nextBeat
  });
}

export function getNowPlaying(state: AppState, time: number, bpm: number) {
  return state.players.flatMap(playerState => {
    if (playerState.playlist) {
      return getPlayerNowPlaying(playerState, state.beat, time, bpm);
    } else {
      return List();
    }
  });
}

