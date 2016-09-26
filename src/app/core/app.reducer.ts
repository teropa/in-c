import { ActionReducer, Action } from '@ngrx/store';
import { List, Map, Repeat } from 'immutable';
import { AppStateRecord, appStateFactory } from './app-state.model';
import { ModuleRecord, moduleFactory } from './module.model';
import { NoteRecord, noteFactory } from './note.model';
import { Player, PlayerRecord, playerFactory } from './player.model';
import { PlayerStateRecord, playerStateFactory} from './player-state.model';
import { PlaylistRecord, playlistFactory} from './playlist.model';
import { PlaylistItemRecord, playlistItemFactory } from './playlist-item.model';
import { PlayerStatsRecord, playerStatsFactory } from './player-stats.model';
import { SoundRecord, soundFactory } from './sound.model';
import { SoundCoordinatesRecord, soundCoordinatesFactory } from './sound-coordinates.model';

import { PLAY, PULSE, ADVANCE, PAUSE, RESUME } from './actions';

const GRACENOTE_DURATION = 0.1;
const ADVANCEMENT_DECAY_FACTORY = 0.95;

const OCTAVE = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

function generateHues(score: ModuleRecord[]) {
  const wrapHue = (n: number) => n % 256;
  return score.reduce((hues, mod) => {
    const direction = Math.random() < 0.5 ? -1 : 1;
    let hue: number;
    if (hues.length) {
      if (mod.changeHue) {
        hue = wrapHue(hues[hues.length - 1] - direction * Math.floor(256 / 3));
      } else {
        hue = wrapHue(hues[hues.length - 1] - direction * 10);
      }
    } else {
      hue = 227;
    }
    return hues.concat(hue);
  }, []);
}

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

function getBeatsUntilStart(score: List<NoteRecord>, noteIdx: number) {
  return score
    .take(noteIdx)
    .reduce((sum, note) => sum + note.duration, 0);
}

function makePlaylistItem(note: NoteRecord, index: number, score: List<NoteRecord>, startBeat: number, hue: number) {
  if (note.note) {
    const fromBeat = startBeat + getBeatsUntilStart(score, index);
    const toBeat = fromBeat + note.duration;
    return playlistItemFactory({
      note: note.note,
      velocity: note.velocity,
      gracenote: note.gracenote,
      fromBeat,
      toBeat,
      hue
    });
  } else {
    return null;
  }
}

function makePlaylist(playerState: PlayerStateRecord, mod: ModuleRecord, fromBeat: number) {
  const items = <List<PlaylistItemRecord>>mod.score
    .map((note, idx) => makePlaylistItem(note, idx, mod.score, fromBeat, mod.hue))
    .filter(itm => !!itm);
  const duration = mod.score.reduce((sum, note) => sum + note.duration, 0);
  return playlistFactory({
    items,
    firstBeat: fromBeat,
    lastBeat: fromBeat + duration,
    imperfectionDelay: -0.005 + Math.random() * 0.01,
    fromModule: mod
  });
}

function canAdvance(playerState: PlayerStateRecord, playerStats: PlayerStatsRecord) {
  const isFarAhead = playerState.moduleIndex - playerStats.minModuleIndex >= 2;
  return !playerState.finished && !isFarAhead;
}

function assignModule(playerState: PlayerStateRecord, score: List<ModuleRecord>, playerStats: PlayerStatsRecord) {
  return playerState.merge({
    moduleIndex: playerState.moduleIndex + 1,
    progress: (playerState.moduleIndex + 2) / score.size * 100
  });
}

function assignPlaylist(playerState: PlayerStateRecord, score: List<ModuleRecord>, beat: number, bpm: number) {
  const shouldBePlaying = playerState.moduleIndex >= 0 && !playerState.finished;
  const hasNothingToPlay = !playerState.playlist || playerState.playlist.lastBeat <= beat;
  if (shouldBePlaying && hasNothingToPlay) {
    const moduleScoreLength = score
      .get(playerState.moduleIndex)
      .score
      .reduce((sum, n) => sum + n.duration, 0);
    const startPlaylistAfterBeat = playerState.playlist ?
      playerState.playlist.lastBeat :
      beat + (moduleScoreLength - beat % moduleScoreLength); // Quantize first module to force unison
    const playlist = makePlaylist(playerState, score.get(playerState.moduleIndex), startPlaylistAfterBeat);
    return playerState.merge({playlist});
  } else {
    return playerState;
  }
}

function getNowPlaying(playerState: PlayerStateRecord, beat: number, time: number, bpm: number) {
  const pulseDuration = 60 / bpm;
  const mod = playerState.playlist.fromModule;
  const playlistFirstBeat = playerState.playlist.firstBeat;
  const headingPauses = mod.score
    .takeWhile(n => !n.note)
    .reduce((sum, n) => sum + n.duration, 0);
  const tailingPauses = mod.score
    .reverse()
    .takeWhile(n => !n.note)
    .reduce((sum, n) => sum + n.duration, 0);
  const modDuration = mod.score
    .reduce((sum, n) => sum + n.duration, 0);

  function makeSoundCoordinates(note: string, duration: number, fromBeat: number) {
    return soundCoordinatesFactory({
      modulePitchExtent: mod.maxNoteValue - mod.minNoteValue + 1,
      relativePitch: noteValue(note) - mod.minNoteValue,
      relativeStart: fromBeat - playlistFirstBeat - headingPauses,
      moduleDuration: modDuration - headingPauses - tailingPauses,
      soundDuration: duration
    });
  }

  function makeSound(note: string, velocity: string, fromOffset: number, toOffset: number, fromBeat: number, toBeat: number, hue: number) {
    return soundFactory({
      instrument: playerState.player.instrument,
      note,
      velocity,
      attackAt: time + fromOffset + playerState.playlist.imperfectionDelay,
      releaseAt: time + toOffset,
      hue,
      coordinates: makeSoundCoordinates(note, toBeat - fromBeat, fromBeat),
      fromPlayer: playerState.player
    })
  }

  return playerState.playlist.items
    .skipWhile(itm => itm.fromBeat < beat)
    .takeWhile(itm => itm.fromBeat < beat + 1)
    .flatMap(itm => {
      const relFromBeat = itm.fromBeat - beat;
      const relToBeat = itm.toBeat - beat;
      const fromOffset = relFromBeat * pulseDuration;
      const toOffset = relToBeat * pulseDuration;
      const sound = makeSound(itm.note, itm.velocity, fromOffset, toOffset, itm.fromBeat, itm.toBeat, itm.hue);
      if (itm.gracenote) {
        const graceRelFromBeat = relFromBeat - GRACENOTE_DURATION;
        const graceRelToBeat = relFromBeat;
        const graceFromOffset = graceRelFromBeat * pulseDuration;
        const graceToOffset = graceRelToBeat * pulseDuration;
        return [
          // Todo: Properly skip gracenotes in visualization (setting 0:s here)
          makeSound(itm.gracenote, 'low', graceFromOffset, graceToOffset, 0, 0, itm.hue),
          sound
        ];
      } else {
        return [sound];
      }
    });
}

function parseNote(noteAndOctave: string): {note: string, octave: number} {
  const [, note, octave] = /^(\w[b\#]?)(\d)$/.exec(noteAndOctave);
  return {note: note.toUpperCase(), octave: parseInt(octave, 10)};
}

function noteValue(noteAndOctave: string) {
  const {note, octave} = parseNote(noteAndOctave);
  return octave * 12 + OCTAVE.indexOf(note);
}

function assignPlaylists(state: AppStateRecord, bpm: number) {
  const {score, beat} = state;
  const players = state.players
    .map(player => assignPlaylist(player, score, beat, bpm));
  return state.merge({players});
}

function updateNowPlaying(state: AppStateRecord, time: number, bpm: number) {
  const nowPlaying = state.players.flatMap(playerState => {
    if (playerState.playlist) {
      return getNowPlaying(playerState, state.beat, time, bpm);
    } else {
      return List();
    }
  });
  return state.merge({nowPlaying});
}

function updatePlayerStats(state: AppStateRecord) {
  const mods = state.players.map(p => p.moduleIndex);
  const totalProgress = state.players.map(p => p.progress).reduce((s, p) => s + p, 0) / state.players.size;
  const stats = state.stats.merge({
    minModuleIndex: mods.min(),
    maxModuleIndex: mods.max(),
    totalProgress
  });
  const players = state.players.map(p => p.merge({canAdvance: canAdvance(p, stats)}));
  return state.merge({stats, players});
}

function advancePlayer(state: AppStateRecord, instrument: string) {
  const playerIdx = state.players.findIndex(p => p.player.instrument === instrument);
  const {score, stats} = state;
  const playerState = state.players.get(playerIdx)
  if (playerState.moduleIndex === score.size - 1) {
    const players = state.players
      .update(playerIdx, player => player.merge({finished: true}));
    return updatePlayerStats(state.merge({players}));
  } else if (canAdvance(state.players.get(playerIdx), state.stats)) {
    const players = state.players
      .update(playerIdx, player => assignModule(player, score, stats));
    return updatePlayerStats(state.merge({players}));
  } else {
    return state;
  }
}

function pulse(state: AppStateRecord, time: number, bpm: number) {
  const nextBeat = state.beat + 1;
  if (!state.playing) {
    state = assignScreensaverModules(state, nextBeat);
  }
  return updateNowPlaying(assignPlaylists(state.set('beat', nextBeat), bpm), time, bpm);
}

function assignScreensaverModules(state: AppStateRecord, nextBeat: number) {
  return state.merge({
    players: state.players.map(p => assignScreensaverModule(p, nextBeat))
  });
}

function assignScreensaverModule(playerState: PlayerStateRecord, nextBeat: number) {
  const hasNothingToPlay = !playerState.playlist || playerState.playlist.lastBeat <= nextBeat;
  if (hasNothingToPlay) {
    return playerState.merge({moduleIndex: Math.floor(Math.random() * 53)});
  } else {
    return playerState;
  }
}

function play(state: AppStateRecord) {
  return state.merge({
    playing: true,
    nowPlaying: List(),
    players: state.players.map(p => p.merge({moduleIndex: -1, playlist: null}))
  });
}

const playerData: Player[] = require('json!../../ensemble.json') ;
const initialPlayerStates = List(playerData.map((p, index) => playerStateFactory({
  player: playerFactory(Object.assign({index}, p)),
  moduleIndex: -1,
  progress: 0,
  canAdvance: true,
  finished: false
})));

const initialState = appStateFactory({
  score: readScore(require('json!../../score.json')),
  playing: false,
  beat: 0,
  players: initialPlayerStates,
  stats: playerStatsFactory().merge({playerCount: initialPlayerStates.size}),
  nowPlaying: List<SoundRecord>(),
  paused: false
});

export const appReducer: ActionReducer<AppStateRecord> = (state = initialState, action: Action) => {
  switch (action.type) {
    case PLAY:
      return play(state);
    case PULSE:
      return pulse(state, action.payload.time, action.payload.bpm);
    case ADVANCE:
      return advancePlayer(state, action.payload);
    case PAUSE:
      return state.merge({paused: true});
    case RESUME:
      return state.merge({paused: false});
    default:
      return state;
  }
}