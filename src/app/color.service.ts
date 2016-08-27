const MIN_OCTAVE = 3;
const MAX_OCTAVE = 5;
const OCTAVE = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export class ColorService {

  getNoteBrightness(noteAndOctave: string) {
    const [, note, octave] = /^(\w[b\#]?)(\d)$/.exec(noteAndOctave);
    const value = this.noteValue(note, parseInt(octave, 10));
    const minValue = this.noteValue(OCTAVE[0], MIN_OCTAVE);
    const maxValue = this.noteValue(OCTAVE[OCTAVE.length - 1], MAX_OCTAVE);
    const valueRange = maxValue - minValue;
    return 100 * (value - minValue) / valueRange;
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