import { List } from 'immutable';

import { Module } from './module.model';
import { GRACENOTE_DURATION } from './note.model';
import { Player } from './player.model';
import { PlayerStats } from './player-stats.model';
import { Playlist } from './playlist.model';
import { PlaylistItem } from './playlist-item.model';
import { Sound } from './sound.model';
import { SoundCoordinates } from './sound-coordinates.model';

export class PlayerState {
  readonly player: Player;
  readonly moduleIndex = -1;
  readonly playlist: Playlist;
  readonly progress = 0;
  readonly finished = false;

  constructor(fields = {}) {
    Object.assign(this, fields);
  }

  hasStarted() {
    return !!this.playlist;
  }

  shouldBePlaying() {
    return this.moduleIndex >= 0 && !this.finished;
  }

  hasNothingToPlay(onBeat: number) {
    return !this.playlist || this.playlist.lastBeat <= onBeat;
  }

  getLastBeat(score: List<Module>, beat: number) {
    const moduleScoreLength = score.get(this.moduleIndex).getDuration();
    return this.hasStarted() ?
      this.playlist.lastBeat :
      beat + (moduleScoreLength - beat % moduleScoreLength); // Quantize first module to force unison
  }

  canAdvance(playerStats: PlayerStats) {
    if (this.isPlayingLast()) {
      // Can only advance (finish) when everyone is on the last module
      return playerStats.totalProgress === 100;
    } else {
      // Can only advance if less than 2 modules ahead of everyone
      const isFarAhead = this.moduleIndex - playerStats.minModuleIndex >= 2;
      return !this.finished && !isFarAhead;
    }
  }

  isPlayingLast() {
    return this.progress === 100 && !this.finished;
  }

  getNowPlaying(beat: number, time: number, bpm: number) {
    const pulseDuration = 60 / bpm;
    const mod = this.playlist.fromModule;
    const playlistFirstBeat = this.playlist.firstBeat;
    return this.playlist.items
      .skipWhile(itm => itm.fromBeat < beat)
      .takeWhile(itm => itm.fromBeat < beat + 1)
      .map(itm => {
        const relFromBeat = itm.fromBeat - beat;
        const relToBeat = itm.toBeat - beat;
        if (itm.note.gracenote) {
          const graceRelFromBeat = relFromBeat - GRACENOTE_DURATION;
          const graceRelToBeat = relFromBeat;
          const graceFromOffset = graceRelFromBeat * pulseDuration;
          const graceToOffset = graceRelToBeat * pulseDuration;
          return Sound.make(this, time, itm.note, graceFromOffset, graceToOffset, 0, 0, itm.hue);
        } else {
          const fromOffset = relFromBeat * pulseDuration;
          const toOffset = relToBeat * pulseDuration;
          return Sound.make(this, time, itm.note, fromOffset, toOffset, itm.fromBeat, itm.toBeat, itm.hue);
        }
      });
  }

  init() {
    return this.merge({moduleIndex: -1, playlist: null});
  }

  assignScreensaverModule(nextBeat: number, scoreSize: number) {
    if (this.hasNothingToPlay(nextBeat)) {
      return this.merge({moduleIndex: Math.floor(Math.random() * scoreSize)});
    } else {
      return this;
    }
  }

  advance(score: List<Module>, playerStats: PlayerStats) {
    if (this.moduleIndex === score.size - 1) {
      return this.merge({finished: true});
    } else if (this.canAdvance(playerStats)) {
      return this.merge({
        moduleIndex: this.moduleIndex + 1,
        progress: (this.moduleIndex + 2) / score.size * 100
      });
    } else {
      return this;
    }
  }

  updatePlaylist(score: List<Module>, beat: number, bpm: number) {
    if (this.shouldBePlaying() && this.hasNothingToPlay(beat)) {
      const lastBeat = this.getLastBeat(score, beat);
      const playlist = Playlist.fromModule(score.get(this.moduleIndex), lastBeat);
      return this.merge({playlist});
    } else {
      return this;
    }
  }


  private merge(next = {}) {
    return new PlayerState(Object.assign({}, this, next));
  }

}



