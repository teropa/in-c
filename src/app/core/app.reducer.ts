import { ActionReducer, Action } from '@ngrx/store';

import { AppState, initialState } from '../model/app-state.model';

import { PLAY, PULSE, ADVANCE } from './actions';

export const appReducer: ActionReducer<AppState> = (state = initialState, action: Action) => {
  switch (action.type) {
    case PLAY:
      return state.play();
    case PULSE:
      return state.pulse(action.payload.time, action.payload.bpm);
    case ADVANCE:
      return state.advancePlayer(action.payload);
    default:
      return state;
  }
}
