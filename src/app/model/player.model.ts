import { List } from 'immutable';
import { TypedRecord, makeTypedFactory } from 'typed-immutable-record';

export interface Player {
  index: number,
  instrument: string,
  instrumentName: string,
  gain: number,
  pan: number
}

export interface PlayerRecord extends TypedRecord<PlayerRecord>, Player {}
export const playerFactory = makeTypedFactory<Player, PlayerRecord>({
  index: 0,
  instrument: null,
  instrumentName: null,
  gain: 1,
  pan: 0
});
