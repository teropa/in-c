import { List } from 'immutable';

import { Note } from './note.model';

// Todo: Could we just hold on to Note instead of copying attributes?
export class PlaylistItem {
  readonly note: string;
  readonly gracenote?: string;
  readonly velocity: 'low' | 'medium' | 'high' = 'medium';
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
      return new PlaylistItem({
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
}



function getBeatsUntilNote(score: List<Note>, noteIdx: number) {
  return score
    .take(noteIdx)
    .reduce((sum, note) => sum + note.duration, 0);
}