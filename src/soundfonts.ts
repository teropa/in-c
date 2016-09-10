import { audioCtx } from './audio-context';

export const soundFonts: Map<string, AudioBuffer> = new Map<string, AudioBuffer>();

// Extend TypeScript's built-in obsolete AudioContext definition
interface FixedAudioContext extends AudioContext {
  decodeAudioData(buf: ArrayBuffer): Promise<AudioBuffer>
}

const SOUNDFONT_URLS = {
  'gnarly-trance-pluck': require('./soundfonts/gnarly-trance-pluck.mp3'),
  'gnarly-trance-pluck-high': require('./soundfonts/gnarly-trance-pluck-high.mp3'),
  'hard-tech-bass': require('./soundfonts/hard-tech-bass-mono.mp3'),
  'rising-waves': require('./soundfonts/rising-waves-mono.mp3'),
  'rising-waves-low': require('./soundfonts/rising-waves-low-mono.mp3'),
  'synthetic-marimba': require('./soundfonts/synthetic-marimba-mono.mp3'),
  'synthetic-marimba-low': require('./soundfonts/synthetic-marimba-low-mono.mp3'),
  'tight-synth-bass': require('./soundfonts/tight-synth-bass-mono.mp3')
};

console.log('loading samples');
Object.keys(SOUNDFONT_URLS).forEach(instrument => {
  loadSample(instrument, SOUNDFONT_URLS[instrument]);
});

function loadSample(instrument: string, url: string) {
  fetch(url)
    .then(res => res.arrayBuffer())
    .then(arrayBuffer => (<FixedAudioContext>audioCtx).decodeAudioData(arrayBuffer))
    .then(audioBuffer => {
      soundFonts.set(instrument, audioBuffer);
    });
}
