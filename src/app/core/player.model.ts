import { List } from 'immutable';
import { TypedRecord, makeTypedFactory } from 'typed-immutable-record';

export interface Player {
  instrument: string,
  instrumentName: string,
  baseGain: number
}

export interface PlayerRecord extends TypedRecord<PlayerRecord>, Player {}
export const playerFactory = makeTypedFactory<Player, PlayerRecord>({
  instrument: null,
  instrumentName: null,
  baseGain: 1
});
