import { List } from 'immutable';
import { TypedRecord, makeTypedFactory } from 'typed-immutable-record';

import { PlayerRecord } from './player.model';
import { SoundCoordinatesRecord } from './sound-coordinates.model';

export interface Sound {
  instrument: string,
  note: string,
  velocity: string,
  attackAt: number,
  releaseAt: number,
  
  hue: number,
  coordinates: SoundCoordinatesRecord

  fromPlayer: PlayerRecord
}

export interface SoundRecord extends TypedRecord<SoundRecord>, Sound {}
export const soundFactory = makeTypedFactory<Sound, SoundRecord>({
  instrument: null,
  note: null,
  velocity: 'medium',
  attackAt: 0,
  releaseAt: 0,
  hue: 0,
  coordinates: null,
  fromPlayer: null
});