import { List } from 'immutable';

import { Note } from './note.model';

export class PlaylistItem {
  readonly note: Note;
  readonly fromBeat = 0;
  readonly toBeat = 0;
  readonly hue = 0;

  constructor(fields = {}) {
    Object.assign(this, fields);
  }

  static fromNote(note: Note, index: number, score: List<Note>, startBeat: number, hue: number) {
    if (note.note) {
      const fromBeat = startBeat + getBeatsUntilNote(score, index);
      const toBeat = fromBeat + note.duration;
      return new PlaylistItem({note, fromBeat, toBeat, hue});
    } else {
      return null;
    }
  }
}



function getBeatsUntilNote(score: List<Note>, noteIdx: number) {
  return score
    .take(noteIdx)
    .reduce((sum, note) => sum + note.duration, 0);
}