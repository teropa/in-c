const MIN_NOTE = {note: 'G', octave: 3};
const MAX_NOTE = {note: 'B', octave: 5};
const OCTAVE = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const MIN_BRIGHTNESS = 33;
const MAX_BRIGHTNESS = 66;

interface Note {
  note: string,
  octave: number
}

export class NoteService {
  private brightnessCache = new Map<string, number>();

  getNoteBrightness(noteAndOctave: string) {
    if (this.brightnessCache.has(noteAndOctave)) {
      return this.brightnessCache.get(noteAndOctave);
    } else {
      const note = this.parseNote(noteAndOctave);
      const value = this.noteValue(note);
      const minValue = this.noteValue(MIN_NOTE);
      const maxValue = this.noteValue(MAX_NOTE);
      const valueRange = maxValue - minValue;
      const relativeValue = (value - minValue) / valueRange;
      const brightnessRange = MAX_BRIGHTNESS - MIN_BRIGHTNESS;
      const brightness = MIN_BRIGHTNESS + brightnessRange * relativeValue;
      this.brightnessCache.set(noteAndOctave, brightness);
      return brightness;
    }
  }

  private parseNote(noteAndOctave: string): Note {
    const [, note, octave] = /^(\w[b\#]?)(\d)$/.exec(noteAndOctave);
    return {note: note.toUpperCase(), octave: parseInt(octave, 10)};
  }

  private noteValue({note, octave}: Note) {
    return octave * 12 + OCTAVE.indexOf(note);
  }

  private flatToSharp(note: string) {
    switch (note) {
      case 'Bb': return 'A#';
      case 'Db': return 'C#';
      case 'Eb': return 'D#';
      case 'Gb': return 'F#';
      case 'Ab': return 'G#';
      default:   return note;
    }
  }


}