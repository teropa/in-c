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

const GRACENOTE_DURATION = 0.15;

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

function makePlaylistItems(note: NoteRecord, noteIdx: number, score: List<NoteRecord>, bpm: number, startTime: number, pan: number) {
  const pulseDuration = 60 / bpm;
  let items = List.of();
  if (note.note) {
    const attackAt = startTime + getPulsesUntilStart(score, noteIdx) * pulseDuration;
    const releaseAt = attackAt + pulseDuration * note.duration;
    items = items.push(playlistItemFactory({
      note: note.note,
      attackAt,
      releaseAt,
      pan
    }));
    if (note.gracenote) {
      items = items.push(playlistItemFactory({
        note: note.gracenote,
        attackAt: attackAt - pulseDuration * GRACENOTE_DURATION,
        releaseAt: attackAt,
        pan
      }))
    }
  }
  return items;
}

function makePlaylist(playerState: PlayerStateRecord, mod: ModuleRecord, startTime: number, beat: number, bpm: number) {
  const pulseDuration = 60 / bpm;
  const items = mod.score.reduce((playlist, note, idx) => {
    return <List<PlaylistItemRecord>>playlist.concat(makePlaylistItems(note, idx, mod.score, bpm, startTime, playerState.player.position));
  }, playerState.playlist ? playerState.playlist.items : <List<PlaylistItemRecord>>List.of());
  const duration = mod.score.reduce((sum, note) => sum + note.duration, 0);
  return playlistFactory({items, lastBeat: beat + duration});
}

function assignModule(playerState: PlayerStateRecord, score: List<ModuleRecord>, time: number, beat: number, bpm: number, playerStats: PlayerStats) {
  if (playerState.moduleIndex === null) {
    return playerState.merge({
      moduleIndex: 0,
      playlist: makePlaylist(playerState, score.get(0), time, beat, bpm)
    });
  } else if (Math.floor(playerState.playlist.lastBeat) <= beat) {
    const fromTime = (playerState.playlist.lastBeat + 1) * 60 / bpm; 
    if (Math.random() < 0.85) {
      return playerState.merge({
        playlist: makePlaylist(playerState, score.get(playerState.moduleIndex), fromTime, playerState.playlist.lastBeat, bpm)
      });
    } else {
      const nextModuleIdx = Math.min(Math.min(playerState.moduleIndex + 1, score.size - 1), playerStats.minModuleIndex + 2);
      return playerState.merge({
        moduleIndex: nextModuleIdx, 
        playlist: makePlaylist(playerState, score.get(nextModuleIdx), fromTime, playerState.playlist.lastBeat, bpm)
      });
    }
  }
  return playerState;
}

function assignNowPlaying(player: PlayerStateRecord, time: number, bpm: number) {
  const pulseDuration = 60 / bpm;
  const nowPlaying = player.playlist.items
    .takeWhile(itm => itm.attackAt < time + pulseDuration);
  return player
    .set('nowPlaying', nowPlaying)
    .updateIn(['playlist', 'items'], itms => itms.skip(nowPlaying.size));
}

function playNext(beat: number, player: PlayerStateRecord, score: List<ModuleRecord>, time: number, bpm: number, playerStats: PlayerStats) {
  if (beat >= 4) {
    return assignNowPlaying(assignModule(player, score, time, beat, bpm, playerStats), time, bpm);
  } else {
    return player;
  }
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
    default:
      return state;
  }
}