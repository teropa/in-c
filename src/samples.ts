import { audioCtx } from './audio-context';

// Extend TypeScript's built-in obsolete AudioContext definition
interface FixedAudioContext extends AudioContext {
  decodeAudioData(buf: ArrayBuffer): Promise<AudioBuffer>
}

const SAMPLE_URLS = {
  'gnarly-trance-pluck-high': require('./soundfonts/gnarly-trance-pluck-velocities-high.mp3'),
  'synthetic-marimba-high': require('./soundfonts/synthetic-marimba-velocities-high-mono.mp3'),
  'tight-synth-bass': require('./soundfonts/tight-synth-bass-velocities-mono.mp3'),
  'glass-string-structures': require('./soundfonts/glass-string-structures-mono.mp3'),
  'delicate-bells': require('./soundfonts/delicate-bells-velocities-mono.mp3'),
  'convolution': require('./samples/minster1_000_ortf_48k.wav')
};


export const samples: Map<string, AudioBuffer>
  = new Map<string, AudioBuffer>();

export const samplesLoaded = Promise.all(
  Object.keys(SAMPLE_URLS)
    .map(key => loadSample(key, SAMPLE_URLS[key]))
).then(() => true);


function loadSample(key: string, url: string) {
  return fetch(url)
    .then(res => res.arrayBuffer())
    .then(arrayBuffer => (<FixedAudioContext>audioCtx).decodeAudioData(arrayBuffer))
    .then(audioBuffer => {
      samples.set(key, audioBuffer);
    });
}
