import {
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core'
import { List } from 'immutable';
import { PlayerState } from '../../model/player-state.model';
import { PlayerStats } from '../../model/player-stats.model';

@Component({
  selector: 'in-c-players',
  template: require('./players.component.html'),
  styles: [require('./players.component.css')]
})
export class PlayersComponent {
  @Input() playerStates: List<PlayerState>;
  @Input() playerStats: PlayerStats;
  @Output() advancePlayer = new EventEmitter();

  trackPlayerState(index: number, obj: PlayerState): any {
    return obj.player.instrument;
  }

}