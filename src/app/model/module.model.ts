import { List } from 'immutable';
import { Memoize } from '../core/memoize-decorator';

import { Note } from './note.model';

export class Module {
  readonly number = -1;
  readonly score = List<Note>();
  readonly changeHue = false;
  readonly hue = 0;

  constructor(fields = {}) {
    Object.assign(this, fields);
  }

  @Memoize
  getDuration() {
    return this.score.reduce((sum, n) => sum + n.duration, 0);
  }

  @Memoize
  getDurationWithoutPauses() {
    return this.getDuration() - this.getHeadingPauseDuration() - this.getTrailingPauseDuration();
  }

  @Memoize
  getHeadingPauseDuration() {
    return this.score
      .takeWhile(n => !n.note)
      .reduce((sum, n) => sum + n.duration, 0);
  }

  @Memoize
  getTrailingPauseDuration() {
    return this.score
      .reverse()
      .takeWhile(n => !n.note)
      .reduce((sum, n) => sum + n.duration, 0);
  }

  @Memoize
  getMinNoteValue() {
    return this.score
      .filter(n => !!n.note)
      .map(n => n.getNoteValue())
      .min();
  }

  @Memoize
  getMaxNoteValue() {
    return this.score
      .filter(n => !!n.note)
      .map(n => n.getNoteValue())
      .max();
  }

}



