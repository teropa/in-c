import { ActionReducer, Action } from '@ngrx/store';
import { List, Map, Repeat } from 'immutable';
import {
  AppStateRecord,
  appStateFactory,
  ModuleRecord,
  moduleFactory,
  NoteRecord,
  noteFactory,
  Player,
  PlayerRecord,
  playerFactory,
  PlayerStateRecord,
  playerStateFactory,
  PlaylistRecord,
  playlistFactory,
  PlaylistItemRecord,
  playlistItemFactory
} from './models';

export const PULSE = 'PULSE';
export const ADJUST_SIZE = 'ADJUST_SIZE';

const GRACENOTE_DURATION = 0.15;

export const MIN_SIZE_GAIN = 0.1;
export const MAX_SIZE_GAIN = 2;
const SIZE_GAIN_STEP = 0.01;

interface PlayerStats {
  minModuleIndex: number;
  maxModuleIndex: number;
}

function readScore(fullScore: ModuleRecord[]): List<ModuleRecord> {
  return List(fullScore.map(({number, score}) => moduleFactory({
    number,
    score: <List<NoteRecord>>List(score.map(noteFactory))
  })));
}

function getPulsesUntilStart(score: List<NoteRecord>, noteIdx: number) {
  return score
    .take(noteIdx)
    .reduce((sum, note) => sum + note.duration, 0);
}

function makePlaylistItems(note: NoteRecord, noteIdx: number, score: List<NoteRecord>, bpm: number, startTime: number, sizeGain: number, player: PlayerRecord) {
  const pulseDuration = 60 / bpm;
  let items = List.of();
  if (note.note) {
    const attackAt = startTime + getPulsesUntilStart(score, noteIdx) * pulseDuration;
    const releaseAt = attackAt + pulseDuration * note.duration;
    items = items.push(playlistItemFactory({
      player,
      note: note.note,
      attackAt,
      releaseAt,
      gain: player.gain * sizeGain
    }));
    if (note.gracenote) {
      items = items.push(playlistItemFactory({
        player,
        note: note.gracenote,
        attackAt: attackAt - pulseDuration * GRACENOTE_DURATION,
        releaseAt: attackAt,
        gain: player.gain * sizeGain
      }))
    }
  }
  return items;
}

function makePlaylist(playerState: PlayerStateRecord, mod: ModuleRecord, startTime: number, beat: number, bpm: number) {
  const pulseDuration = 60 / bpm;
  const items = mod.score.reduce((playlist, note, idx) => {
    return <List<PlaylistItemRecord>>playlist.concat(makePlaylistItems(note, idx, mod.score, bpm, startTime, playerState.sizeGain, playerState.player));
  }, playerState.playlist ? playerState.playlist.items : <List<PlaylistItemRecord>>List.of());
  const duration = mod.score.reduce((sum, note) => sum + note.duration, 0);
  return playlistFactory({
    items,
    lastBeat: beat + duration,
    imperfectionDelay: -0.005 + Math.random() * 0.01
  });
}

function moveToNext(playerState: PlayerStateRecord, playerStats: PlayerStats) {
  const definitelyMoveByBeat = 500;
  const moveProbability = playerState.timeSpentOnModule / definitelyMoveByBeat;
  const limiter = Math.max(0, playerState.moduleIndex - playerStats.minModuleIndex - 1);
  const limitedMoveProbability = moveProbability / Math.pow(10, limiter);
  return Math.random() < limitedMoveProbability;
}

function assignModule(playerState: PlayerStateRecord, score: List<ModuleRecord>, time: number, beat: number, bpm: number, playerStats: PlayerStats) {
  if (!playerState.playlist) {
    if (moveToNext(playerState, playerStats)) {
      return playerState.merge({
        moduleIndex: 0,
        timeSpentOnModule: 0,
        playlist: makePlaylist(playerState, score.get(0), time, beat, bpm)
      });
    } else {
      return playerState.update('timeSpentOnModule', t => t + 1);
    }
  } else if (Math.floor(playerState.playlist.lastBeat) <= beat) {
    const nextModuleIdx = playerState.moduleIndex + 1;
    if (nextModuleIdx < score.size && moveToNext(playerState, playerStats)) {
      return playerState.merge({
        moduleIndex: nextModuleIdx,
        timeSpentOnModule: 0,
        playlist: makePlaylist(playerState, score.get(nextModuleIdx), time, playerState.playlist.lastBeat, bpm)
      });
    } else {
      return playerState.merge({
        playlist: makePlaylist(playerState, score.get(playerState.moduleIndex), time, playerState.playlist.lastBeat, bpm),
        timeSpentOnModule: playerState.timeSpentOnModule + 1
      });
    }
  }
  return playerState.update('timeSpentOnModule', t => t + 1);
}

function assignNowPlaying(player: PlayerStateRecord, time: number, bpm: number) {
  if (player.playlist) {
    const pulseDuration = 60 / bpm;
    const nowPlaying = player.playlist && player.playlist.items
      .takeWhile(itm => itm.attackAt < time + pulseDuration)
      .map(itm => itm.update('attackAt', a => a + player.playlist.imperfectionDelay));
    return player
      .set('nowPlaying', nowPlaying)
      .updateIn(['playlist', 'items'], itms => itms.skip(nowPlaying.size));
  } else {
    return player;
  }
}

function playNext(beat: number, player: PlayerStateRecord, score: List<ModuleRecord>, time: number, bpm: number, playerStats: PlayerStats) {
  return assignNowPlaying(assignModule(player, score, time, beat, bpm, playerStats), time, bpm);
}

function collectPlayerStats(players: List<PlayerStateRecord>): PlayerStats {
  const mods = players.map(p => p.moduleIndex);
  return {
    minModuleIndex: mods.min(),
    maxModuleIndex: mods.max()
  };
}

const initialPlayerStates = List((<Player[]>require('json!../ensemble.json'))
  .map((p: Player) => playerStateFactory({player: playerFactory(p)}))
);
const initialState = appStateFactory({
  score: readScore(require('json!../score.json')),
  beat: 0,
  players: initialPlayerStates
});

export const appReducer: ActionReducer<AppStateRecord> = (state = initialState, action: Action) => {
  switch (action.type) {
    case PULSE:
      const nextBeat = state.beat + 1;
      const playerStats = collectPlayerStats(state.players);
      return state
        .set('beat', nextBeat)
        .update('players', players => players.map((player: PlayerStateRecord) => playNext(nextBeat, player, state.score, action.payload.time, action.payload.bpm, playerStats)));
    case ADJUST_SIZE:
      const playerIdx = state.players.findIndex(p => p.player.instrument === action.payload.instrument);
      return state
        .updateIn(['players', playerIdx], (p: PlayerStateRecord) =>
          p.update('sizeGain', (s: number) => Math.max(MIN_SIZE_GAIN, Math.min(MAX_SIZE_GAIN, s + action.payload.amount * SIZE_GAIN_STEP))));
    default:
      return state;
  }
}