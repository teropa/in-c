import { List } from 'immutable';

import { Note } from './note.model';

export class Module {
  readonly number = -1;
  readonly score = List<Note>();
  readonly minNoteValue = 0;
  readonly maxNoteValue = 0;
  readonly changeHue = false;
  readonly hue = 0;

  constructor(fields = {}) {
    Object.assign(this, fields);
  }

  getDuration() {
    return this.score.reduce((sum, n) => sum + n.duration, 0);
  }

  getDurationWithoutPauses() {
    return this.getDuration() - this.getHeadingPauseDuration() - this.getTrailingPauseDuration();
  }

  getHeadingPauseDuration() {
    return this.score
      .takeWhile(n => !n.note)
      .reduce((sum, n) => sum + n.duration, 0);
  }

  getTrailingPauseDuration() {
    return this.score
      .reverse()
      .takeWhile(n => !n.note)
      .reduce((sum, n) => sum + n.duration, 0);
  }

}



