import { List } from 'immutable';
import { TypedRecord, makeTypedFactory } from 'typed-immutable-record';

export interface AppState {
  score: List<ModuleRecord>,
  beat: number;
  players: List<PlayerStateRecord>
}

export interface Module {
  number: number,
  score: List<NoteRecord>,
  changeHue?: boolean,
  hue: number
}

export interface Note {
  note?: string,
  duration: number,
  gracenote?: string
}

export interface Player {
  instrument: string,
  baseGain: number
}

export interface PlayerState {
  player: PlayerRecord;
  moduleIndex?: number;
  timeSpentOnModule?: number;
  playlist?: PlaylistRecord;
  nowPlaying?: List<PlaylistItemRecord>;
  gainAdjust?: number;
  pan: number;
  y: number;
}

export interface Playlist {
  items: List<PlaylistItemRecord>,
  lastBeat: number,
  imperfectionDelay: number
}

export interface PlaylistItem {
  note: string,
  attackAt: number,
  releaseAt: number,
  hue: number
}


export interface ModuleRecord extends TypedRecord<ModuleRecord>, Module {}
export const moduleFactory = makeTypedFactory<Module, ModuleRecord>({
  number: -1,
  score: <List<NoteRecord>>List.of(),
  hue: 0
});

export interface NoteRecord extends TypedRecord<NoteRecord>, Note {}
export const noteFactory = makeTypedFactory<Note, NoteRecord>({
  note: null,
  duration: 1,
  gracenote: null
});

export interface PlaylistRecord extends TypedRecord<PlaylistRecord>, Playlist {}
export const playlistFactory = makeTypedFactory<Playlist, PlaylistRecord>({
  items: <List<PlaylistItemRecord>>List.of(),
  lastBeat: 0,
  imperfectionDelay: 0
});

export interface PlaylistItemRecord extends TypedRecord<PlaylistItemRecord>, PlaylistItem {}
export const playlistItemFactory = makeTypedFactory<PlaylistItem, PlaylistItemRecord>({
  note: null,
  attackAt: 0,
  releaseAt: 0,
  hue: 0
});

export interface PlayerRecord extends TypedRecord<PlayerRecord>, Player {}
export const playerFactory = makeTypedFactory<Player, PlayerRecord>({
  instrument: null,
  baseGain: 1
});

export interface PlayerStateRecord extends TypedRecord<PlayerStateRecord>, PlayerState {}
export const playerStateFactory = makeTypedFactory<PlayerState, PlayerStateRecord>({
  player: playerFactory(),
  moduleIndex: null,
  timeSpentOnModule: 0,
  playlist: null,
  nowPlaying: <List<PlaylistItemRecord>>List.of(),
  gainAdjust: 1,
  pan: 0,
  y: 100
});

export interface AppStateRecord extends TypedRecord<AppStateRecord>, AppState {}
export const appStateFactory = makeTypedFactory<AppState, AppStateRecord>({
  score: null,
  beat: -1,
  players: null
});
