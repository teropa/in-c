import { ActionReducer, Action } from '@ngrx/store';

import { AppStateRecord, initialState } from '../model/app-state.model';

import { play } from './play';
import { pulse } from './pulse';
import { advance } from './advance';

import { PLAY, PULSE, ADVANCE, PAUSE, RESUME } from './actions';

export const appReducer: ActionReducer<AppStateRecord> = (state = initialState, action: Action) => {
  switch (action.type) {
    case PLAY:
      return play(state);
    case PULSE:
      return pulse(state, action.payload.time, action.payload.bpm);
    case ADVANCE:
      return advance(state, action.payload);
    case PAUSE:
      return state.merge({paused: true});
    case RESUME:
      return state.merge({paused: false});
    default:
      return state;
  }
}
