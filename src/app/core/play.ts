import { List } from 'immutable';
import { AppStateRecord } from '../model/app-state.model';
import { PlayerStateRecord } from '../model/player-state.model';

export function play(state: AppStateRecord) {
  return state.merge({
    playing: true,
    nowPlaying: List(),
    players: state.players.map(initPlayerState)
  });
}

function initPlayerState(playerState: PlayerStateRecord) {
  return playerState.merge({moduleIndex: -1, playlist: null});
}

