import { ActionReducer, Action } from '@ngrx/store';
import { List, Map, Repeat } from 'immutable';
import {
  AppStateRecord,
  appStateFactory,
  ModuleRecord,
  moduleFactory,
  NoteRecord,
  noteFactory,
  PlayerStateRecord,
  playerStateFactory,
  PlaylistRecord,
  playlistFactory,
  PlaylistItemRecord,
  playlistItemFactory
} from './models';

export const PULSE = 'PULSE';

const GRACENOTE_DURATION = 0.15;


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

function makePlaylistItems(note: NoteRecord, noteIdx: number, score: List<NoteRecord>, bpm: number, startTime: number) {
  const pulseDuration = 60 / bpm;
  let items = List.of();
  if (note.note) {
    const attackAt = startTime + getPulsesUntilStart(score, noteIdx) * pulseDuration;
    const releaseAt = attackAt + pulseDuration * note.duration;
    items = items.push(playlistItemFactory({
      note: note.note,
      attackAt,
      releaseAt
    }));
    if (note.gracenote) {
      items = items.push(playlistItemFactory({
        note: note.gracenote,
        attackAt: attackAt - pulseDuration * GRACENOTE_DURATION,
        releaseAt: attackAt
      }))
    }
  }
  return items;
}

function makePlaylist(playlist: PlaylistRecord, mod: ModuleRecord, startTime: number, beat: number, bpm: number) {
  const pulseDuration = 60 / bpm;
  const items = mod.score.reduce((playlist, note, idx) => {
    return <List<PlaylistItemRecord>>playlist.concat(makePlaylistItems(note, idx, mod.score, bpm, startTime));
  }, playlist ? playlist.items : <List<PlaylistItemRecord>>List.of());
  const duration = mod.score.reduce((sum, note) => sum + note.duration, 0);
  return playlistFactory({items, lastBeat: beat + duration});
}

function assignModule(player: PlayerStateRecord, score: List<ModuleRecord>, time: number, beat: number, bpm: number) {
  if (player.moduleIndex === null) {
    return player.merge({moduleIndex: 0, moduleRepeat: 1, playlist: makePlaylist(player.playlist, score.get(0), time, beat, bpm)});
  } else if (Math.floor(player.playlist.lastBeat) <= beat) {
    const fromTime = (player.playlist.lastBeat + 1) * 60 / bpm; 
    if (player.moduleRepeat <= 2) {
      return player.merge({moduleRepeat: player.moduleRepeat + 1, playlist: makePlaylist(player.playlist, score.get(player.moduleIndex), fromTime, player.playlist.lastBeat, bpm)});
    } else {
      const nextModuleIdx = Math.min(player.moduleIndex + 1, score.size - 1);
      return player.merge({moduleIndex: nextModuleIdx, moduleRepeat: 0, playlist: makePlaylist(player.playlist, score.get(nextModuleIdx), fromTime, player.playlist.lastBeat, bpm)});
    }
  }
  return player;
}

function assignNowPlaying(player: PlayerStateRecord, time: number, bpm: number) {
  const pulseDuration = 60 / bpm;
  const nowPlaying = player.playlist.items
    .takeWhile(itm => itm.attackAt < time + pulseDuration);
  return player
    .set('nowPlaying', nowPlaying)
    .updateIn(['playlist', 'items'], itms => itms.skip(nowPlaying.size));
}

function playNext(beat: number, player: PlayerStateRecord, score: List<ModuleRecord>, time: number, bpm: number) {
  if (beat >= 4) {
    return assignNowPlaying(assignModule(player, score, time, beat, bpm), time, bpm);
  } else {
    return player;
  }
}

const initialState = appStateFactory({
  score: readScore(require('json!../score.json')),
  beat: 0,
  players: List.of(playerStateFactory({}))
});

export const appReducer: ActionReducer<AppStateRecord> = (state = initialState, action: Action) => {
  switch (action.type) {
    case PULSE:
      const nextBeat = state.beat + 1;
      return state
        .set('beat', nextBeat)
        .update('players', players => players.map((player: PlayerStateRecord) => playNext(nextBeat, player, state.score, action.payload.time, action.payload.bpm)));
    default:
      return state;
  }
}