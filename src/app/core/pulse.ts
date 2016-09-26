import { List } from 'immutable';
import { AppStateRecord } from '../model/app-state.model';
import { ModuleRecord, moduleDuration, headingPauseDuration, moduleDurationWithoutPauses } from '../model/module.model';
import { NoteRecord, noteValue } from '../model/note.model';
import { PlayerStateRecord, shouldBePlaying, hasNothingToPlay, getLastBeat } from '../model/player-state.model';
import { playlistFactory, makePlaylist } from '../model/playlist.model';
import { PlaylistItemRecord } from '../model/playlist-item.model';
import { soundFactory } from '../model/sound.model';
import { soundCoordinatesFactory } from '../model/sound-coordinates.model';

const GRACENOTE_DURATION = 0.1;

export function pulse(state: AppStateRecord, time: number, bpm: number) {
  const nextBeat = state.beat + 1;
  if (!state.playing) {
    state = assignScreensaverModules(state, nextBeat, state.score.size);
  }
  return updateNowPlaying(assignPlaylists(state.set('beat', nextBeat), bpm), time, bpm);
}

function assignScreensaverModules(state: AppStateRecord, nextBeat: number, scoreSize: number) {
  return state.merge({
    players: state.players.map(p => assignScreensaverModule(p, nextBeat, scoreSize))
  });
}

function assignScreensaverModule(playerState: PlayerStateRecord, nextBeat: number, scoreSize: number) {
  if (hasNothingToPlay(playerState, nextBeat)) {
    return playerState.merge({moduleIndex: Math.floor(Math.random() * scoreSize)});
  } else {
    return playerState;
  }
}

function assignPlaylists(state: AppStateRecord, bpm: number) {
  const players = state.players
    .map(player => assignPlaylist(player, state.score, state.beat, bpm));
  return state.merge({players});
}

function assignPlaylist(playerState: PlayerStateRecord, score: List<ModuleRecord>, beat: number, bpm: number) {
  if (shouldBePlaying(playerState) && hasNothingToPlay(playerState, beat)) {
    const lastBeat = getLastBeat(playerState, score, beat);
    const playlist = makePlaylist(score.get(playerState.moduleIndex), lastBeat);
    return playerState.merge({playlist});
  } else {
    return playerState;
  }
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

function getNowPlaying(playerState: PlayerStateRecord, beat: number, time: number, bpm: number) {
  const pulseDuration = 60 / bpm;
  const mod = playerState.playlist.fromModule;
  const playlistFirstBeat = playerState.playlist.firstBeat;
 
  function makeSoundCoordinates(note: string, duration: number, fromBeat: number) {
    return soundCoordinatesFactory({
      modulePitchExtent: mod.maxNoteValue - mod.minNoteValue + 1,
      relativePitch: noteValue(note) - mod.minNoteValue,
      relativeStart: fromBeat - playlistFirstBeat - headingPauseDuration(mod),
      moduleDuration: moduleDurationWithoutPauses(mod),
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
