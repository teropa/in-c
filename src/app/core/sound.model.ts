import { List } from 'immutable';
import { TypedRecord, makeTypedFactory } from 'typed-immutable-record';

export interface Sound {
  instrument: string,
  note: string,
  attackAt: number,
  releaseAt: number,
  pan: number,
  gain: number
}

export interface SoundRecord extends TypedRecord<SoundRecord>, Sound {}
export const soundFactory = makeTypedFactory<Sound, SoundRecord>({
  instrument: null,
  note: null,
  attackAt: 0,
  releaseAt: 0,
  pan: 0,
  gain: 1
});