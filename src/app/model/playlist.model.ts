import { List } from 'immutable';

import { Module } from './module.model';
import { PlaylistItem } from './playlist-item.model';

export class Playlist {
  readonly items = List<PlaylistItem>();
  readonly firstBeat = 0;
  readonly lastBeat = 0;
  readonly imperfectionDelay = 0;
  readonly fromModule: Module;

  constructor(fields = {}) {
    Object.assign(this, fields);
  }

  static fromModule(mod: Module, fromBeat: number) {
    const items = <List<PlaylistItem>>mod.score
      .map((note, idx) => PlaylistItem.fromNote(note, idx, mod.score, fromBeat, mod.hue))
      .filter(itm => !!itm);
    return new Playlist({
      items,
      firstBeat: fromBeat,
      lastBeat: fromBeat + mod.getDuration(),
      imperfectionDelay: -0.005 + Math.random() * 0.01,
      fromModule: mod
    });
  }

}

