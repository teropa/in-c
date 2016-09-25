import {
  ChangeDetectionStrategy,
  Component,
  Input,
} from '@angular/core';
import { Store } from '@ngrx/store'; 

import { AppState } from '../core/app-state.model';
import { PlayerState } from '../core/player-state.model';
import { ADVANCE } from '../core/actions';

@Component({
  selector: 'in-c-player',
  template: `
    <div class="progress-controls">
      <in-c-progress-circle [progress]="playerState.progress" [hue]="playerState.playlist?.fromModule.hue">
      </in-c-progress-circle>
      <button md-fab (click)="advance()" [disabled]="!playerState.canAdvance">
        <md-icon *ngIf="!isPlaying()" class="md-24" title="Start">play_arrow</md-icon>
        <md-icon *ngIf="isPlaying()" class="md-24" title="Advance">fast_forward</md-icon>
      </button>
    </div>
  `,
  styles: [`
    :host {
      display: flex;
    }
    .progress-controls {
      flex: 1;

      position: relative;
      color: white;
    }
    in-c-progress-circle, .progress-controls button {
      position: absolute;
      left: 50%;
      top: 50%;
    }
    in-c-progress-circle {
      margin-left: -50px;
      margin-top: -50px;
    }
    .progress-controls button {
      margin-left: -27px;
      margin-top: -27px;
      background-color: rgba(255, 255, 255, 0.2);
    }

  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlayerComponent {
  @Input() playerState: PlayerState;

  constructor(private store: Store<AppState>) {
  }

  isPlaying() {
    return this.playerState.moduleIndex >= 0;
  }

  advance() {
    this.store.dispatch({type: ADVANCE, payload: this.playerState.player.instrument});
  }

}
