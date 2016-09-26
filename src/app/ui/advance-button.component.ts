import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';
import { PlayerState } from '../model/player-state.model';

@Component({
  selector: 'in-c-advance-button',
  template: `
    <button md-fab
            (click)="advance.next()"
            [disabled]="!playerState.canAdvance"
            [ngSwitch]="getState()">
      <md-icon *ngSwitchCase="'notStarted'" class="md-24" title="Start">play_arrow</md-icon>
      <md-icon *ngSwitchCase="'playing'" class="md-24" title="Advance">fast_forward</md-icon>
      <md-icon *ngSwitchCase="'playingLast'" class="md-24" title="Stop">stop</md-icon>
    </button>
  `,
  styles: [`
    button {
      background-color: rgb(255, 255, 255);
      color: black;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdvanceButtonComponent {
  @Input() playerState: PlayerState;
  @Output() advance = new EventEmitter();

  getState() {
    if (this.playerState.progress === 100 && !this.playerState.finished) {
      return 'playingLast';
    } else if (this.playerState.moduleIndex >= 0) {
      return 'playing';
    } else {
      return 'notStarted';
    }
  }

}