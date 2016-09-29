import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';

import { PlayerState } from '../../model/player-state.model';
import { PlayerStats } from '../../model/player-stats.model';

@Component({
  selector: 'in-c-player',
  template: require('./player.component.html'),
  styles: [require('./player.component.css')],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlayerComponent {
  @Input() playerState: PlayerState;
  @Input() playerStats: PlayerStats;
  @Output() advance = new EventEmitter();
}
