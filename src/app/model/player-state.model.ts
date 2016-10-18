import { List } from 'immutable';

import { Module, getModuleDuration } from './module.model';
import { GRACENOTE_DURATION } from './note.model';
import { Player } from './player.model';
import { PlayerStats } from './player-stats.model';
import { Playlist, playlistFromModule } from './playlist.model';
import { PlaylistItem } from './playlist-item.model';
import { Sound, makeSound } from './sound.model';

export interface PlayerState {
  readonly player: Player;
  readonly moduleIndex: number;
  readonly playlist: Playlist;
  readonly progress: number;
  readonly finished: boolean;
}

export function hasPlayerStarted(ps: PlayerState) {
  return !!ps.playlist;
}

export function shouldPlayerBePlaying(ps: PlayerState) {
  return ps.moduleIndex >= 0 && !ps.finished;
}

export function playerHasNothingToPlay(ps: PlayerState, onBeat: number) {
  return !ps.playlist || ps.playlist.lastBeat <= onBeat;
}

export function getPlayerLastBeat(ps: PlayerState, score: List<Module>, beat: number) {
  const moduleScoreLength = getModuleDuration(score.get(ps.moduleIndex));
  return hasPlayerStarted(ps) ?
    ps.playlist.lastBeat :
    beat + (moduleScoreLength - beat % moduleScoreLength); // Quantize first module to force unison
}

export function canPlayerAdvance(ps: PlayerState, playerStats: PlayerStats) {
  if (isPlayerPlayingLast(ps)) {
    // Can only advance (finish) when everyone is on the last module
    return playerStats.totalProgress === 100;
  } else {
    // Can only advance if less than 2 modules ahead of everyone
    const isFarAhead = ps.moduleIndex - playerStats.minModuleIndex >= 2;
    return !ps.finished && !isFarAhead;
  }
}

export function isPlayerPlayingLast(ps: PlayerState) {
  return ps.progress === 100 && !ps.finished;
}

export function getPlayerNowPlaying(ps: PlayerState, beat: number, time: number, bpm: number) {
  const pulseDuration = 60 / bpm;
  const mod = ps.playlist.fromModule;
  const playlistFirstBeat = ps.playlist.firstBeat;
  return ps.playlist.items
    .skipWhile(itm => itm.fromBeat < beat)
    .takeWhile(itm => itm.fromBeat < beat + 1)
    .map(itm => {
      const relFromBeat = itm.fromBeat - beat;
      const relToBeat = itm.toBeat - beat;
      if (itm.note.gracenote) {
        const graceRelFromBeat = relFromBeat - GRACENOTE_DURATION;
        const graceRelToBeat = relFromBeat;
        const graceFromOffset = graceRelFromBeat * pulseDuration;
        const graceToOffset = graceRelToBeat * pulseDuration;
        return makeSound(ps, time, itm.note, graceFromOffset, graceToOffset, 0, 0, itm.hue);
      } else {
        const fromOffset = relFromBeat * pulseDuration;
        const toOffset = relToBeat * pulseDuration;
        return makeSound(ps, time, itm.note, fromOffset, toOffset, itm.fromBeat, itm.toBeat, itm.hue);
      }
    });
}

export function initPlayerState(ps: PlayerState): PlayerState {
  return Object.assign({}, ps, {moduleIndex: -1, playlist: null});
}

export function assignScreensaverModuleToPlayer(ps: PlayerState, nextBeat: number, scoreSize: number): PlayerState {
  if (playerHasNothingToPlay(ps, nextBeat)) {
    return Object.assign({}, ps, {moduleIndex: Math.floor(Math.random() * scoreSize)});
  } else {
    return ps;
  }
}

export function advancePlayerState(ps: PlayerState, score: List<Module>, playerStats: PlayerStats): PlayerState {
  if (ps.moduleIndex === score.size - 1) {
    return Object.assign({}, ps, {finished: true});
  } else if (canPlayerAdvance(ps, playerStats)) {
    return Object.assign({}, ps, {
      moduleIndex: ps.moduleIndex + 1,
      progress: (ps.moduleIndex + 2) / score.size * 100
    });
  } else {
    return ps;
  }
}

export function updatePlayerPlaylist(ps: PlayerState, score: List<Module>, beat: number, bpm: number): PlayerState {
  if (shouldPlayerBePlaying(ps) && playerHasNothingToPlay(ps, beat)) {
    const lastBeat = getPlayerLastBeat(ps, score, beat);
    const playlist = playlistFromModule(score.get(ps.moduleIndex), lastBeat);
    return Object.assign({}, ps, {playlist});
  } else {
    return ps;
  }
}
