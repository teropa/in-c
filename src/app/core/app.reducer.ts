import { ActionReducer, Action } from '@ngrx/store';
import { List } from 'immutable';
import { AppState } from '../model/app-state.model';
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
      return state.play();
    case PULSE:
      return state.pulse(action.payload.time, action.payload.bpm);
    case ADVANCE:
      return state.advancePlayer(action.payload);
    default:
      return state;
  }
}


function getInitialState() {
  const score = readScore();
  const players = readEnsemble();
  return new AppState({
    score,
    players,
    stats: new PlayerStats({playerCount: players.size}),
    nowPlaying: List<Sound>(),
  });
}

function readScore(): List<Module> {
  const hues = generateHues(SCORE_DATA);
  return List(SCORE_DATA.map(({number, score}, idx) => {
    const parsedScore = List<Note>(score.map((n: any) => new Note(n)));
    return new Module({
      number,
      score: parsedScore,
      hue: hues[idx]
    });
  }));
}

function readEnsemble() {
  return List(ENSEMBLE_DATA.map((p: Player, index: number) => new PlayerState({
    player: new Player(Object.assign({index}, p)),
  })));
}

