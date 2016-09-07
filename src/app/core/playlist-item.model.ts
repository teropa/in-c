import { List } from 'immutable';
import { TypedRecord, makeTypedFactory } from 'typed-immutable-record';

export interface PlaylistItem {
  note: string,
  attackAt: number,
  releaseAt: number,
  hue: number
}

export interface PlaylistItemRecord extends TypedRecord<PlaylistItemRecord>, PlaylistItem {}
export const playlistItemFactory = makeTypedFactory<PlaylistItem, PlaylistItemRecord>({
  note: null,
  attackAt: 0,
  releaseAt: 0,
  hue: 0
});