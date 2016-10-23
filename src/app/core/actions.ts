import { Action } from '@ngrx/store';

export const PLAY = 'PLAY';
export const PULSE = 'PULSE';
export const ADVANCE = 'ADVANCE';

export function play(): Action {
  return {
    type: PLAY
  };
}

export function pulse(time: number, bpm: number): Action {
  return {
    type: PULSE,
    payload: {time, bpm}
  };
}

export function advance(instrument: string): Action {
  return {
    type: ADVANCE,
    payload: {instrument}
  }
}
