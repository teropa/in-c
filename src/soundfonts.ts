import { audioCtx } from './audio-context';

export const soundFonts: Map<string, AudioBuffer> = new Map<string, AudioBuffer>();

// Extend TypeScript's built-in obsolete AudioContext definition
interface FixedAudioContext extends AudioContext {
  decodeAudioData(buf: ArrayBuffer): Promise<AudioBuffer>
}

const SOUNDFONT_URLS = {
  'gnarly-trance-pluck': require('./soundfonts/gnarly-trance-pluck-velocities.mp3'),
  'gnarly-trance-pluck-high': require('./soundfonts/gnarly-trance-pluck-velocities-high.mp3'),
  //'hard-tech-bass': require('./soundfonts/hard-tech-bass-mono.mp3'),
  //'rising-waves': require('./soundfonts/rising-waves-mono.mp3'),
  //'rising-waves-low': require('./soundfonts/rising-waves-low-mono.mp3'),
  'synthetic-marimba': require('./soundfonts/synthetic-marimba-velocities-mono.mp3'),
  'synthetic-marimba-high': require('./soundfonts/synthetic-marimba-velocities-high-mono.mp3'),
  'tight-synth-bass': require('./soundfonts/tight-synth-bass-velocities-mono.mp3'),
  'classic-rock-organ': require('./soundfonts/classic-rock-organ-velocities-mono.mp3'),
  'classic-rock-organ-high': require('./soundfonts/classic-rock-organ-velocities-high-mono.mp3')

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
