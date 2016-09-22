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
import { PULSE, ADVANCE, ADJUST_PAN, ADJUST_GAIN, PAUSE, RESUME } from './actions';

const GRACENOTE_DURATION = 0.15;
const ADVANCEMENT_DECAY_FACTORY = 0.95;

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
  return List(fullScore.map(({number, score}, idx) => moduleFactory({
    number,
    score: <List<NoteRecord>>List(score.map(noteFactory)),
    hue: hues[idx]
  })));
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
  }
}

function makePlaylist(playerState: PlayerStateRecord, mod: ModuleRecord, fromBeat: number) {
  const items = <List<PlaylistItemRecord>>mod.score
    .map((note, idx) => makePlaylistItem(note, idx, mod.score, fromBeat, mod.hue))
    .filter(itm => !!itm);
  const duration = mod.score.reduce((sum, note) => sum + note.duration, 0);
  return playlistFactory({
    items,
    lastBeat: fromBeat + duration,
    imperfectionDelay: -0.005 + Math.random() * 0.01
  });
}

function canAdvance(playerState: PlayerStateRecord, score: List<ModuleRecord>, playerStats: PlayerStatsRecord) {
  const isLast = playerState.moduleIndex === score.size - 1;
  const isFarAhead = playerState.moduleIndex - playerStats.minModuleIndex >= 2;
  return !isLast && !isFarAhead;
}

function assignModule(playerState: PlayerStateRecord, score: List<ModuleRecord>, playerStats: PlayerStatsRecord) {
  if (canAdvance(playerState, score, playerStats)) {
    return playerState.merge({
      moduleIndex: playerState.moduleIndex + 1,
      progress: (playerState.moduleIndex + 2) / score.size * 100
    });
  } else {
    return playerState;
  }
}

function assignPlaylist(playerState: PlayerStateRecord, score: List<ModuleRecord>, beat: number, bpm: number) {
  const shouldBePlaying = playerState.moduleIndex >= 0;
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

  function makeSound(note: string, velocity: string, fromOffset: number, toOffset: number, hue: number) {
    return soundFactory({
      instrument: playerState.player.instrument,
      note,
      velocity,
      attackAt: time + fromOffset + playerState.playlist.imperfectionDelay,
      releaseAt: time + toOffset,
      hue,
      fromModuleIdx: playerState.moduleIndex
    })
  }

  return playerState.playlist.items
    .skipWhile(itm => itm.fromBeat < beat)
    .takeWhile(itm => itm.fromBeat < beat + 1)
    .flatMap(itm => {
      const fromOffset = (itm.fromBeat - beat) * pulseDuration;
      const toOffset = (itm.toBeat - beat) * pulseDuration;
      const sound = makeSound(itm.note, itm.velocity, fromOffset, toOffset, itm.hue);
      if (itm.gracenote) {
        return [
          makeSound(itm.gracenote, 'low', fromOffset - GRACENOTE_DURATION * pulseDuration, fromOffset, itm.hue),
          sound
        ];
      } else {
        return [sound];
      }
    });
}

function assignPlaylists(state: AppStateRecord, bpm: number) {
  const {score, beat} = state;
  const players = state.players
    .map(player => assignPlaylist(player, score, beat, bpm));
  return state.merge({players});
}

function updateNowPlaying(state: AppStateRecord, time: number, bpm: number) {
  const players = state.players.map(playerState => {
    if (playerState.playlist) {
      return playerState.merge({nowPlaying: getNowPlaying(playerState, state.beat, time, bpm)});
    } else {
      return playerState;
    }
  });
  return state.merge({players});
}

function updatePlayerStats(state: AppStateRecord) {
  const mods = state.players.map(p => p.moduleIndex);
  const totalProgress = state.players.map(p => p.progress).reduce((s, p) => s + p, 0) / state.players.size;
  const stats = state.stats.merge({
    minModuleIndex: mods.min(),
    maxModuleIndex: mods.max(),
    totalProgress
  });
  const players = state.players.map(p => p.merge({canAdvance: canAdvance(p, state.score, stats)}));
  return state.merge({stats, players});
}

function advancePlayer(state: AppStateRecord, instrument: string) {
  const playerIdx = state.players.findIndex(p => p.player.instrument === instrument);
  const {score, stats} = state;
  if (canAdvance(state.players.get(playerIdx), score, state.stats)) {
    const players = state.players
      .update(playerIdx, player => assignModule(player, score, stats));
    return updatePlayerStats(state.merge({players}));
  } else {
    return state;
  }
}

function pulse(state: AppStateRecord, time: number, bpm: number) {
  const nextBeat = state.beat + 1;
  return updateNowPlaying(assignPlaylists(state.set('beat', nextBeat), bpm), time, bpm);
}

const playerData: Player[] = require('json!../../ensemble.json') ;
const initialPlayerStates = List(playerData.map((p, i) => playerStateFactory({
  player: playerFactory(p),
  moduleIndex: -1,
  progress: 0,
  canAdvance: true,
  nowPlaying: List.of<SoundRecord>(),
  pan: (i / (playerData.length - 1)) * 2 - 1,
  gain: 0.75
})));

const initialState = appStateFactory({
  score: readScore(require('json!../../score.json')),
  beat: 0,
  players: initialPlayerStates,
  stats: playerStatsFactory().merge({playerCount: initialPlayerStates.size}),
  paused: false
});

export const appReducer: ActionReducer<AppStateRecord> = (state = initialState, action: Action) => {
  switch (action.type) {
    case PULSE:
      return pulse(state, action.payload.time, action.payload.bpm);
    case ADVANCE:
      return advancePlayer(state, action.payload);
    case ADJUST_PAN:
      const playerIdxForPan = state.players
        .findIndex(p => p.player.instrument === action.payload.instrument);
      return state
        .setIn(['players', playerIdxForPan, 'pan'], Math.min(1, Math.max(-1, action.payload.pan)));
    case ADJUST_GAIN:
      const playerIdxForGain = state.players
        .findIndex(p => p.player.instrument === action.payload.instrument);
      return state
        .setIn(['players', playerIdxForGain, 'gain'], Math.min(1, Math.max(0, action.payload.gain)));
    case PAUSE:
      return state.merge({paused: true});
    case RESUME:
      return state.merge({paused: false});
    default:
      return state;
  }
}