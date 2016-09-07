import { List } from 'immutable';
import { TypedRecord, makeTypedFactory } from 'typed-immutable-record';

import { PlaylistItemRecord } from './playlist-item.model';

export interface Playlist {
  items: List<PlaylistItemRecord>,
  lastBeat: number,
  imperfectionDelay: number
}

export interface PlaylistRecord extends TypedRecord<PlaylistRecord>, Playlist {}
export const playlistFactory = makeTypedFactory<Playlist, PlaylistRecord>({
  items: <List<PlaylistItemRecord>>List.of(),
  lastBeat: 0,
  imperfectionDelay: 0
});