import { ActionReducer, Action } from '@ngrx/store';
import { Map } from 'immutable';
import { TypedRecord, makeTypedFactory } from 'typed-immutable-record';

export const PULSE = 'PULSE';

export interface PlayerState {
  module: number;
}

export interface AppState {
  beat: number;
  players: PlayerState[]
}

interface AppStateRecord extends TypedRecord<AppStateRecord>, AppState {}

const defaultAppState = {
  beat: 0,
  players: [
    {module: -1}
  ]
};

function play(player: PlayerState) {
  return player;
}

export const appReducer: ActionReducer<AppStateRecord> = (state: AppStateRecord = makeTypedFactory<AppState, AppStateRecord>(defaultAppState)(), action: Action) => {
  switch (action.type) {
    case PULSE:
      return state
        .update('beat', b => b + 1)
        .update('players', p => p.map(play));
    default:
      return state;
  }
}