import { List } from 'immutable';

import { Note } from './note.model';

export interface PlaylistItem {
  readonly note: Note;
  readonly fromBeat: number;
  readonly toBeat: number;
  readonly hue: number;
}

export function playlistItemFromNote(note: Note, index: number, score: List<Note>, startBeat: number, hue: number): PlaylistItem {
  if (note.note) {
    const fromBeat = startBeat + getBeatsUntilNote(score, index);
    const toBeat = fromBeat + note.duration;
    return {note, fromBeat, toBeat, hue};
  } else {
    return null;
  }
}


function getBeatsUntilNote(score: List<Note>, noteIdx: number) {
  return score
    .take(noteIdx)
    .reduce((sum, note) => sum + note.duration, 0);
}