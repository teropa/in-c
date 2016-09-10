const MIN_OCTAVE = 3;
const MAX_OCTAVE = 5;
const OCTAVE = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const MIN_BRIGHTNESS = 33;
const MAX_BRIGHTNESS = 66;

export class ColorService {
  private brightnessCache = new Map<string, number>();

  getNoteBrightness(noteAndOctave: string) {
    if (this.brightnessCache.has(noteAndOctave)) {
      return this.brightnessCache.get(noteAndOctave);
    } else {
      const [, note, octave] = /^(\w[b\#]?)(\d)$/.exec(noteAndOctave);
      const value = this.noteValue(note, parseInt(octave, 10));
      const minValue = this.noteValue(OCTAVE[0], MIN_OCTAVE);
      const maxValue = this.noteValue(OCTAVE[OCTAVE.length - 1], MAX_OCTAVE);
      const valueRange = maxValue - minValue;
      const relativeValue = (value - minValue) / valueRange;
      const brightnessRange = MAX_BRIGHTNESS - MIN_BRIGHTNESS;
      const brightness = MIN_BRIGHTNESS + brightnessRange * relativeValue;
      this.brightnessCache.set(noteAndOctave, brightness);
      return brightness;
    }
  }

  private noteValue(note: string, octave: number) {
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