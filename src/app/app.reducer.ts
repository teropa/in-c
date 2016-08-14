import { ActionReducer, Action } from '@ngrx/store';
import { List, Map, Repeat, fromJS } from 'immutable';
import { TypedRecord, makeTypedFactory } from 'typed-immutable-record';

export const PULSE = 'PULSE';

const GRACENOTE_DURATION = 0.15;

export interface AppState {
  score: List<Module>,
  beat: number;
  players: List<PlayerState>
}

export interface Module {
  number: number,
  score: List<Note>
}

export interface Note {
  note?: string,
  duration: number,
  gracenote?: string
}

export interface PlayerState {
  moduleIndex?: number;
  moduleRepeat?: number;
  playlist?: Playlist,
  nowPlaying?: List<PlaylistItem>
}

export interface Playlist {
  items: List<PlaylistItem>,
  lastBeat: number
}

export interface PlaylistItem {
  note: string,
  attackAt: number,
  releaseAt: number
}


interface ModuleRecord extends TypedRecord<ModuleRecord>, Module {}
const moduleFactory = makeTypedFactory<Module, ModuleRecord>({number: -1, score: <List<Note>>List.of()});
interface NoteRecord extends TypedRecord<NoteRecord>, Note {}
const noteFactory = makeTypedFactory<Note, NoteRecord>({note: null, duration: 1, gracenote: null});
interface PlaylistRecord extends TypedRecord<PlaylistRecord>, Playlist {}
const playlistFactory = makeTypedFactory<Playlist, PlaylistRecord>({items: <List<PlaylistItem>>List.of(), lastBeat: 0});
interface PlaylistItemRecord extends TypedRecord<PlaylistItemRecord>, PlaylistItem {}
const playlistItemFactory = makeTypedFactory<PlaylistItem, PlaylistItemRecord>({note: null, attackAt: 0, releaseAt: 0});
interface PlayerStateRecord extends TypedRecord<PlayerStateRecord>, PlayerState {}
const playerStateFactory = makeTypedFactory<PlayerState, PlayerStateRecord>({moduleIndex: null, moduleRepeat: null, playlist: null, nowPlaying: <List<PlaylistItem>>List.of()});


const defaultAppState = {
  score: readScore(require('json!../score.json')),
  beat: 0,
  players: List.of(playerStateFactory({}))
};

interface AppStateRecord extends TypedRecord<AppStateRecord>, AppState {}
const appStateFactory = makeTypedFactory<AppState, AppStateRecord>(defaultAppState)

function readScore(fullScore: Module[]): List<Module> {
  return List(fullScore.map(({number, score}) => moduleFactory({number, score: <List<Note>>List(score.map(noteFactory))})));
}

function getPulsesUntilStart(score: List<Note>, noteIdx: number) {
  return score
    .take(noteIdx)
    .reduce((sum, note) => sum + note.duration, 0);
}

function makePlaylistItems(note: Note, noteIdx: number, score: List<Note>, bpm: number, startTime: number) {
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

function makePlaylist(playlist: Playlist, mod: Module, startTime: number, beat: number, bpm: number) {
  const pulseDuration = 60 / bpm;
  const items = mod.score.reduce((playlist, note, idx) => {
    return <List<PlaylistItem>>playlist.concat(makePlaylistItems(note, idx, mod.score, bpm, startTime));
  }, playlist ? playlist.items : <List<PlaylistItem>>List.of());
  const duration = mod.score.reduce((sum, note) => sum + note.duration, 0);
  return playlistFactory({items, lastBeat: beat + duration});
}

function assignModule(player: PlayerStateRecord, score: List<Module>, time: number, beat: number, bpm: number) {
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

function playNext(beat: number, player: PlayerStateRecord, score: List<Module>, time: number, bpm: number) {
  if (beat >= 4) {
    return assignNowPlaying(assignModule(player, score, time, beat, bpm), time, bpm);
  } else {
    return player;
  }
}

export const appReducer: ActionReducer<AppStateRecord> =
  (state: AppStateRecord = makeTypedFactory<AppState, AppStateRecord>(defaultAppState)(), action: Action) => {
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