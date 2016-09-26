import { Module } from './module.model';

export function generateHues(score: Module[]) {
  return score.reduce((hues, mod) => {
    const direction = Math.random() < 0.5 ? -1 : 1;
    let hue: number;
    if (hues.length) {
      const prevHue = hues[hues.length - 1];
      if (mod.changeHue) {
        hue = wrapHue(prevHue - direction * Math.floor(256 / 3));
      } else {
        hue = wrapHue(prevHue - direction * 10);
      }
    } else {
      hue = 227;
    }
    return hues.concat(hue);
  }, []);
}

function wrapHue(hue: number) {
  return hue % 256;
}