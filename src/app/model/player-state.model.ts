import { List } from 'immutable';
import { TypedRecord, makeTypedFactory } from 'typed-immutable-record';

import { ModuleRecord, moduleDuration } from './module.model';
import { Player, PlayerRecord, playerFactory } from './player.model';
import { PlaylistRecord } from './playlist.model';
import { PlaylistItemRecord } from './playlist-item.model';

const ENSEMBLE_DATA: Player[] = require('json!../../ensemble.json') ;

export interface PlayerState {
  player: PlayerRecord,
  moduleIndex?: number,
  progress?: number,
  canAdvance: boolean,
  playlist?: PlaylistRecord,
  finished: boolean
}

export interface PlayerStateRecord extends TypedRecord<PlayerStateRecord>, PlayerState {}

const playerStateFactory = makeTypedFactory<PlayerState, PlayerStateRecord>({
  player: null,
  moduleIndex: null,
  progress: null,
  canAdvance: null,
  playlist: null,
  finished: null
});

export const initialPlayerStates = List(ENSEMBLE_DATA.map((p, index) => playerStateFactory({
  player: playerFactory(Object.assign({index}, p)),
  moduleIndex: -1,
  progress: 0,
  canAdvance: true,
  finished: false
})));

export function shouldBePlaying(playerState: PlayerState) {
  return playerState.moduleIndex >= 0 && !playerState.finished;
}

export function hasNothingToPlay(playerState: PlayerState, beat: number) {
  return !playerState.playlist || playerState.playlist.lastBeat <= beat;
}

export function getLastBeat(playerState: PlayerStateRecord, score: List<ModuleRecord>, beat: number) {
  const moduleScoreLength = moduleDuration(score.get(playerState.moduleIndex));
  return playerState.playlist ?
      playerState.playlist.lastBeat :
      beat + (moduleScoreLength - beat % moduleScoreLength); // Quantize first module to force unison
}