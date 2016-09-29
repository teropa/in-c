import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';
import { PlayerState } from '../../model/player-state.model';
import { PlayerStats } from '../../model/player-stats.model';

@Component({
  selector: 'in-c-advance-button',
  template: require('./advance-button.component.html'),
  styles: [require('./advance-button.component.css')],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdvanceButtonComponent {
  @Input() playerState: PlayerState;
  @Input() playerStats: PlayerStats;
  @Output() advance = new EventEmitter();

  getState(): 'notStarted' | 'playing' | 'playingLast' {
    if (this.playerState.progress === 100 && !this.playerState.finished) {
      return 'playingLast';
    } else if (this.playerState.moduleIndex >= 0) {
      return 'playing';
    } else {
      return 'notStarted';
    }
  }

}