import { List } from 'immutable';
import { TypedRecord, makeTypedFactory } from 'typed-immutable-record';

import { ModuleRecord, moduleFactory } from './module.model';
import { NoteRecord, noteFactory, noteValue } from './note.model';
import { PlayerStateRecord, initialPlayerStates } from './player-state.model';
import { PlayerStatsRecord, playerStatsFactory } from './player-stats.model';
import { SoundRecord } from './sound.model';
import { generateHues } from './generate-hues';

const SCORE_DATA = require('json!../../score.json');

export interface AppState {
  playing: boolean,
  score: List<ModuleRecord>,
  beat: number;
  players: List<PlayerStateRecord>,
  stats: PlayerStatsRecord,
  nowPlaying: List<SoundRecord>,
  paused: boolean
}

export interface AppStateRecord extends TypedRecord<AppStateRecord>, AppState {}

const appStateFactory = makeTypedFactory<AppState, AppStateRecord>({
  playing: false,
  score: null,
  beat: -1,
  players: null,
  stats: null,
  nowPlaying: List<SoundRecord>(),
  paused: false
});

export const initialState = appStateFactory({
  score: readScore(SCORE_DATA),
  playing: false,
  beat: 0,
  players: initialPlayerStates,
  stats: playerStatsFactory().merge({playerCount: initialPlayerStates.size}),
  nowPlaying: List<SoundRecord>(),
  paused: false
});

function readScore(fullScore: ModuleRecord[]): List<ModuleRecord> {
  const hues = generateHues(fullScore);
  return List(fullScore.map(({number, score}, idx) => {
    const parsedScore = <List<NoteRecord>>List(score.map(noteFactory));
    const allNoteValues = parsedScore
      .filter(n => !!n.note)
      .map(n => noteValue(n.note));
    return moduleFactory({
      number,
      score: parsedScore,
      hue: hues[idx],
      minNoteValue: allNoteValues.min(),
      maxNoteValue: allNoteValues.max()
    });
  }));
}