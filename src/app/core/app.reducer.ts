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
import { PULSE, ADVANCE, ADJUST_PAN } from './actions';

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

function makePlaylistItem(note: NoteRecord, noteIdx: number, score: List<NoteRecord>, startBeat: number, hue: number) {
  if (note.note) {
    const fromBeat = startBeat + getBeatsUntilStart(score, noteIdx);
    const toBeat = fromBeat + note.duration;
    return playlistItemFactory({
      note: note.note,
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

function canAdvance(playerState: PlayerStateRecord, score: List<ModuleRecord>, beat: number, playerStats: PlayerStatsRecord) {
  if (!playerState.playlist) {
    return true;
  } else {
    const hasMoreModules = playerState.moduleIndex + 1 < score.size;
    const hasEveryoneStarted = playerStats.minModuleIndex >= 0;
    return hasMoreModules && hasEveryoneStarted;
  }
}

function assignModule(playerState: PlayerStateRecord, score: List<ModuleRecord>, beat: number, playerStats: PlayerStatsRecord) {
  if (canAdvance(playerState, score, beat, playerStats)) {
    return playerState.merge({
      moduleIndex: playerState.moduleIndex + 1,
      advanceFactor: playerState.advanceFactor * 1 / Math.pow(ADVANCEMENT_DECAY_FACTORY, playerStats.playerCount)
    });
  } else {
    return playerState;
  }
}

function assignPlaylist(playerState: PlayerStateRecord, score: List<ModuleRecord>, time: number, beat: number, bpm: number) {
  const shouldBePlaying = playerState.moduleIndex >= 0;
  const hasNothingToPlay = !playerState.playlist || playerState.playlist.lastBeat <= beat;
  if (shouldBePlaying && hasNothingToPlay) {
    const moduleScoreLength = score.get(playerState.moduleIndex).score.size;
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
  
  function makeSound(note: string, fromOffset: number, toOffset: number) {
    return soundFactory({
      instrument: playerState.player.instrument,
      note: note,
      gain: playerState.player.baseGain,
      pan: playerState.pan,
      attackAt: time + fromOffset + playerState.playlist.imperfectionDelay,
      releaseAt: time + toOffset,
      playerState
    })
  }

  return playerState.playlist && playerState.playlist.items
    .skipWhile(itm => itm.fromBeat < beat)
    .takeWhile(itm => itm.fromBeat < beat + 1)
    .flatMap(itm => {
      const fromOffset = (itm.fromBeat - beat) * pulseDuration;
      const toOffset = (itm.toBeat - beat) * pulseDuration;
      const sound = makeSound(itm.note, fromOffset, toOffset);
      if (itm.gracenote) {
        return [
          makeSound(itm.gracenote, fromOffset - GRACENOTE_DURATION * pulseDuration, fromOffset),
          sound
        ];
      } else {
        return [sound];
      }
    });
}

function assignPlaylists(state: AppStateRecord, time: number, bpm: number) {
  const {score, beat} = state;
  const players = state.players
    .map(player => assignPlaylist(player, score, time, beat, bpm));
  return state.merge({players});
}

function updateNowPlaying(state: AppStateRecord, time: number, bpm: number) {
  return state.merge({
    nowPlaying: state.players.flatMap(player => getNowPlaying(player, state.beat, time, bpm))
  });
}

function updatePlayerStats(state: AppStateRecord) {
  const mods = state.players.map(p => p.moduleIndex);
  const timesToLastBeat = state.players.map(p => p.playlist ? p.playlist.lastBeat - state.beat : 0);
  return state.mergeIn(['stats'], {
    minModuleIndex: mods.min(),
    maxModuleIndex: mods.max(),
    minTimeToLastBeat: timesToLastBeat.min(),
    maxTimeToLastBeat: timesToLastBeat.max()
  });
}

function advancePlayer(state: AppStateRecord, instrument: string) {
  const playerIdx = state.players.findIndex(p => p.player.instrument === instrument);
  const {score, beat, stats} = state;
  if (canAdvance(state.players.get(playerIdx), score, beat, state.stats)) {
    const players = state.players
      .update(playerIdx, player => assignModule(player, score, beat, stats))
      .map(player => decayAdvancementFactor(player));
    return state.merge({players});
  } else {
    return state;
  }
}

function decayAdvancementFactor(playerState: PlayerStateRecord) {
  const advanceFactor = playerState.advanceFactor * ADVANCEMENT_DECAY_FACTORY;
  return playerState.merge({advanceFactor});
}

function pulse(state: AppStateRecord, time: number, bpm: number) {
  const nextBeat = state.beat + 1;
  return updatePlayerStats(updateNowPlaying(assignPlaylists(state.set('beat', nextBeat), time, bpm), time, bpm));
}

const initialPlayerStates = List((<Player[]>require('json!../../ensemble.json'))
  .map((p: Player) => playerStateFactory({
    player: playerFactory(p),
    moduleIndex: -1,
    advanceFactor: 1,
    pan: Math.random() * 2 - 1,
    y: Math.random() * 2 - 1
  }))
);

const initialState = appStateFactory({
  score: readScore(require('json!../../score.json')),
  beat: 0,
  players: initialPlayerStates,
  stats: playerStatsFactory().merge({playerCount: initialPlayerStates.size}),
  nowPlaying: <List<SoundRecord>>List.of()
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
      // Todo: could use mergeIn but there's a bug in immutable typescript definitions 
      return state
        .setIn(['players', playerIdxForPan, 'pan'], Math.min(1, Math.max(-1, action.payload.pan)))
        .setIn(['players', playerIdxForPan, 'y'], action.payload.y);
    default:
      return state;
  }
}