import { ActionReducer, Action } from '@ngrx/store';
import { List } from 'immutable';
import { AppState, play, pulse, advancePlayer, areAllFinished } from '../model/app-state.model';
import { Module } from '../model/module.model';
import { Note } from '../model/note.model';
import { Player } from '../model/player.model';
import { PlayerState } from '../model/player-state.model';
import { PlayerStats } from '../model/player-stats.model';
import { Sound } from '../model/sound.model';

import { generateHues } from './generate-hues';
import { PLAY, PULSE, ADVANCE } from './actions';

const ENSEMBLE_DATA: any[] = require('json!../../ensemble.json');
const SCORE_DATA: any[] = require('json!../../score.json');

export const appReducer: ActionReducer<AppState> = (state = getInitialState(), action: Action) => {
  switch (action.type) {
    case PLAY:
      return play(state);
    case PULSE:
      return pulse(state, action.payload.time, action.payload.bpm);
    case ADVANCE:
      const advancedState = advancePlayer(state, action.payload);
      if (areAllFinished(advancedState)) {
        return getInitialState();
      } else {
        return advancedState;
      }
    default:
      return state;
  }
}


function getInitialState(): AppState {
  const score = readScore();
  const players = readEnsemble();
  return {
    playing: false,
    beat: -1,
    score,
    players,
    stats: {
      playerCount: players.size,
      minModuleIndex: 0,
      maxModuleIndex: 0,
      totalProgress: 0
    },
    nowPlaying: List<Sound>(),
  };
}

function readScore(): List<Module> {
  const hues = generateHues(SCORE_DATA);
  return List(SCORE_DATA.map(({number, score}, idx) => {
    return {
      number,
      score: List<Note>(score),
      hue: hues[idx]
    };
  }));
}

function readEnsemble() {
  return List<PlayerState>(ENSEMBLE_DATA.map((p: Player, index: number) => ({
    player: Object.assign({index}, p),
  })));
}

