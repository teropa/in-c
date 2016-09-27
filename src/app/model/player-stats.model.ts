import { List } from 'immutable';
import { PlayerState } from './player-state.model';

export class PlayerStats {
  readonly minModuleIndex: number;
  readonly maxModuleIndex: number;
  readonly playerCount = 0;
  readonly totalProgress = 0;

  constructor(fields = {}) {
    Object.assign(this, fields);
  }

  update(players: List<PlayerState>) {
    const mods = players.map(p => p.moduleIndex);
    const totalProgress = players.map(p => p.progress).reduce((s, p) => s + p, 0) / players.size;
    return this.merge({
      minModuleIndex: mods.min(),
      maxModuleIndex: mods.max(),
      totalProgress
    });
  }

  private merge(changes = {}) {
    return new PlayerStats(Object.assign({}, this, changes));
  }

}

