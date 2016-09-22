import { List } from 'immutable';
import { TypedRecord, makeTypedFactory } from 'typed-immutable-record';

import { PlaylistItemRecord } from './playlist-item.model';
import { ModuleRecord } from './module.model';

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