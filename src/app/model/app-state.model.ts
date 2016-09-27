import { List } from 'immutable';

import { Module } from './module.model';
import { Note, noteValue } from './note.model';
import { PlayerState, initialPlayerStates } from './player-state.model';
import { PlayerStats } from './player-stats.model';
import { Sound } from './sound.model';
import { generateHues } from './generate-hues';

const SCORE_DATA = require('json!../../score.json');

export class AppState {
  readonly playing = false;
  readonly score: List<Module>;
  readonly beat = 0;
  readonly players: List<PlayerState>;
  readonly stats: PlayerStats;
  readonly nowPlaying: List<Sound>;

  constructor(fields = {}) {
    Object.assign(this, fields);
  }

  play() {
    return this.merge({
      playing: true,
      nowPlaying: List<Sound>(),
      players: this.players.map(p => p.init())
    });
  }

  advancePlayer(instrument: string) {
    const playerIdx = this.players.findIndex(p => p.player.instrument === instrument);
    const newPlayers = this.players.update(playerIdx, (p: PlayerState) => p.advance(this.score, this.stats));
    return this.merge({
      players: newPlayers,
      stats: this.stats.update(newPlayers)
    });
  }

  pulse(time: number, bpm: number) {
    const nextBeat = this.beat + 1;
    const updatedPlayerStates = this.players
      .map(playerState => {
        if (!this.playing) {
          playerState = playerState.assignScreensaverModule(nextBeat, this.score.size);
        }
        return playerState.updatePlaylist(this.score, nextBeat, bpm)
      });           
    const nowPlaying = this.getNowPlaying(time, bpm);
    return this.merge({
      players: updatedPlayerStates,
      nowPlaying,
      beat: nextBeat
    });
  }

  private getNowPlaying(time: number, bpm: number) {
    return this.players.flatMap(playerState => {
      if (playerState.playlist) {
        return playerState.getNowPlaying(this.beat, time, bpm);
      } else {
        return List();
      }
    });
  }

  private merge(changes = {}) {
    return new AppState(Object.assign({}, this, changes));
  }

}

export const initialState = new AppState({
  score: readScore(SCORE_DATA),
  players: initialPlayerStates,
  stats: new PlayerStats({playerCount: initialPlayerStates.size}),
  nowPlaying: List<Sound>(),
});

function readScore(fullScore: Module[]): List<Module> {
  const hues = generateHues(fullScore);
  return List(fullScore.map(({number, score}, idx) => {
    const parsedScore = <List<Note>>List(score.map(n => new Note(n)));
    const allNoteValues = parsedScore
      .filter(n => !!n.note)
      .map(n => noteValue(n.note));
    return new Module({
      number,
      score: parsedScore,
      hue: hues[idx],
      minNoteValue: allNoteValues.min(),
      maxNoteValue: allNoteValues.max()
    });
  }));
}