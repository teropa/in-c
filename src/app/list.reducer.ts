import { ActionReducer, Action } from '@ngrx/store';
import { List } from 'immutable';

export const ADD = 'ADD';
export const REMOVE = 'REMOVE';

export const listReducer: ActionReducer<List<string>> = (state: List<string> = <List<string>>List.of(), action: Action) => {
  switch (action.type) {
    case ADD:
      return state.push(action.payload);
    case REMOVE:
      return state.remove(action.payload);
    default:
      return state;
  }
}