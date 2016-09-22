import { List } from 'immutable';
import { TypedRecord, makeTypedFactory } from 'typed-immutable-record';

import { PlayerStateRecord } from './player-state.model';
import { SoundCoordinatesRecord } from './sound-coordinates.model';

export interface Sound {
  instrument: string,
  note: string,
  velocity: string,
  attackAt: number,
  releaseAt: number,
  
  hue: number,
  coordinates: SoundCoordinatesRecord
}

export interface SoundRecord extends TypedRecord<SoundRecord>, Sound {}
export const soundFactory = makeTypedFactory<Sound, SoundRecord>({
  instrument: null,
  note: null,
  velocity: 'medium',
  attackAt: 0,
  releaseAt: 0,
  hue: 0,
  coordinates: null
});