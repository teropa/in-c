import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';
import { PlayerState } from '../core/player-state.model';

@Component({
  selector: 'in-c-advance-button',
  template: `
    <button md-fab (click)="advance.next()" [disabled]="!playerState.canAdvance">
      <md-icon *ngIf="!isPlaying()" class="md-24" title="Start">play_arrow</md-icon>
      <md-icon *ngIf="isPlaying()" class="md-24" title="Advance">fast_forward</md-icon>
    </button>
  `,
  styles: [`
    button {
      background-color: rgba(255, 255, 255, 0.2);
    }
  `]
})
export class AdvanceButtonComponent {
  @Input() playerState: PlayerState;
  @Output() advance = new EventEmitter();

  isPlaying() {
    return this.playerState.moduleIndex >= 0;
  }

}