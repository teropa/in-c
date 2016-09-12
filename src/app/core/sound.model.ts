import { List } from 'immutable';
import { TypedRecord, makeTypedFactory } from 'typed-immutable-record';

import { PlayerStateRecord } from './player-state.model';

export interface Sound {
  instrument: string,
  note: string,
  velocity: string,
  attackAt: number,
  releaseAt: number,
  pan: number,
  gain: number,
  hue: number,
  playerState: PlayerStateRecord
}

export interface SoundRecord extends TypedRecord<SoundRecord>, Sound {}
export const soundFactory = makeTypedFactory<Sound, SoundRecord>({
  instrument: null,
  note: null,
  velocity: 'medium',
  attackAt: 0,
  releaseAt: 0,
  pan: 0,
  gain: 1,
  hue: 0,
  playerState: null
});