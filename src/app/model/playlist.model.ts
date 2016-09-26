import { List } from 'immutable';
import { TypedRecord, makeTypedFactory } from 'typed-immutable-record';

import { PlaylistItemRecord, makePlaylistItem } from './playlist-item.model';
import { ModuleRecord, moduleDuration } from './module.model';

export interface Playlist {
  items: List<PlaylistItemRecord>,
  firstBeat: number,
  lastBeat: number,
  imperfectionDelay: number,
  fromModule: ModuleRecord
}

export interface PlaylistRecord extends TypedRecord<PlaylistRecord>, Playlist {}
export const playlistFactory = makeTypedFactory<Playlist, PlaylistRecord>({
  items: <List<PlaylistItemRecord>>List.of(),
  firstBeat: 0,
  lastBeat: 0,
  imperfectionDelay: 0,
  fromModule: null
});

export function makePlaylist(mod: ModuleRecord, fromBeat: number) {
  const items = <List<PlaylistItemRecord>>mod.score
    .map((note, idx) => makePlaylistItem(note, idx, mod.score, fromBeat, mod.hue))
    .filter(itm => !!itm);
  return playlistFactory({
    items,
    firstBeat: fromBeat,
    lastBeat: fromBeat + moduleDuration(mod),
    imperfectionDelay: -0.005 + Math.random() * 0.01,
    fromModule: mod
  });
}