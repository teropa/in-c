import { List } from 'immutable';

import { Module, getModuleDuration } from './module.model';
import { PlaylistItem, playlistItemFromNote } from './playlist-item.model';

export interface Playlist {
  readonly items: List<PlaylistItem>;
  readonly firstBeat: number;
  readonly lastBeat: number;
  readonly imperfectionDelay: number;
  readonly fromModule: Module;
}

export function playlistFromModule(mod: Module, firstBeat: number): Playlist {
  const items = <List<PlaylistItem>>mod.score
    .map((note, idx) => playlistItemFromNote(note, idx, mod.score, firstBeat, mod.hue))
    .filter(itm => !!itm);
  return {
    items,
    firstBeat,
    lastBeat: firstBeat + getModuleDuration(mod),
    imperfectionDelay: -0.005 + Math.random() * 0.01,
    fromModule: mod
  };
}