import { ActionReducer, Action } from '@ngrx/store';
import { List, Map, fromJS } from 'immutable';
import { TypedRecord, makeTypedFactory } from 'typed-immutable-record';

export const PULSE = 'PULSE';


export interface AppState {
  score: List<Module>,
  beat: number;
  players: List<PlayerState>
}

export interface Module {
  number: number,
  beats: List<List<string>>
}

export interface PlayerState {
  module?: Module;
  currentBeat?: number;
  nowPlaying?: List<string>
}

interface ModuleRecord extends TypedRecord<ModuleRecord>, Module {}
const moduleFactory = makeTypedFactory<Module, ModuleRecord>({number: -1, beats: <List<List<string>>>List.of()});
interface PlayerStateRecord extends TypedRecord<PlayerStateRecord>, PlayerState {}
const playerStateFactory = makeTypedFactory<PlayerState, PlayerStateRecord>({module: null, currentBeat: null, nowPlaying: <List<string>>List.of()});


const defaultAppState = {
  score: readScore(require('json!../score.json')),
  beat: 0,
  players: List.of(playerStateFactory({}))
};

interface AppStateRecord extends TypedRecord<AppStateRecord>, AppState {}
const appStateFactory = makeTypedFactory<AppState, AppStateRecord>(defaultAppState)

function readScore(score: Module[]): List<Module> {
  return List(score.map(({number, beats}) => moduleFactory({number, beats: fromJS(beats)})));
}

function assignModule(player: PlayerStateRecord, score: List<Module>) {
  if (!player.module) {
    return player.merge({module: score.get(0), currentBeat: -1});
  }
  return player;
}

function assignBeat(player: PlayerStateRecord) {
  if (player.currentBeat < player.module.beats.size - 1) {
    return player.update('currentBeat', b => b + 1);
  } else {
    return player.set('currentBeat', 0);
  }
}

function playCurrentBeat(player: PlayerStateRecord) {
  return player.set('nowPlaying', player.module.beats.get(player.currentBeat));
}

function playNext(player: PlayerStateRecord, score: List<Module>) {
  return playCurrentBeat(assignBeat(assignModule(player, score)));
}

export const appReducer: ActionReducer<AppStateRecord> =
  (state: AppStateRecord = makeTypedFactory<AppState, AppStateRecord>(defaultAppState)(), action: Action) => {
  switch (action.type) {
    case PULSE:
      return state
        .update('beat', b => b + 1)
        .update('players', players => players.map((player: PlayerStateRecord) => playNext(player, state.score)));
    default:
      return state;
  }
}