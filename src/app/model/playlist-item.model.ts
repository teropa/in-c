import { List } from 'immutable';
import { TypedRecord, makeTypedFactory } from 'typed-immutable-record';

import { NoteRecord } from './note.model';

export interface PlaylistItem {
  note: string,
  gracenote: string,
  velocity: string,
  fromBeat: number,
  toBeat: number,
  hue: number
}

export interface PlaylistItemRecord extends TypedRecord<PlaylistItemRecord>, PlaylistItem {}
export const playlistItemFactory = makeTypedFactory<PlaylistItem, PlaylistItemRecord>({
  note: null,
  gracenote: null,
  velocity: 'medium',
  fromBeat: 0,
  toBeat: 0,
  hue: 0
});

export function makePlaylistItem(note: NoteRecord, index: number, score: List<NoteRecord>, startBeat: number, hue: number) {
  if (note.note) {
    const fromBeat = startBeat + getBeatsUntilNote(score, index);
    const toBeat = fromBeat + note.duration;
    return playlistItemFactory({
      note: note.note,
      velocity: note.velocity,
      gracenote: note.gracenote,
      fromBeat,
      toBeat,
      hue
    });
  } else {
    return null;
  }
}

function getBeatsUntilNote(score: List<NoteRecord>, noteIdx: number) {
  return score
    .take(noteIdx)
    .reduce((sum, note) => sum + note.duration, 0);
}