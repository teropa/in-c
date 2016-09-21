import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  Output
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { Store } from '@ngrx/store'; 

import { AppState } from '../core/app-state.model';
import { PlayerState } from '../core/player-state.model';
import { ADVANCE } from '../core/actions';
import { TimeService } from '../core/time.service';

@Component({
  selector: 'in-c-player',
  template: `
    <in-c-sound-vis [nowPlaying]="playerState.nowPlaying" [width]="availableWidth" [height]="availableHeight">
    </in-c-sound-vis>
    <div class="progress-controls">
      <md-progress-circle mode="determinate" color="accent" [value]="playerState.progress">
      </md-progress-circle>
      <button md-fab (click)="advance()" [disabled]="!playerState.canAdvance">
        <md-icon *ngIf="!isPlaying()" class="md-24" title="Start">play_arrow</md-icon>
        <md-icon *ngIf="isPlaying()" class="md-24" title="Advance">fast_forward</md-icon>
      </button>
    </div>
  `,
  styles: [`
    :host {
      position: relative;
    }
    in-c-sound-vis, progress-controls {
      position: absolute;
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
    }

    .progress-controls {
      color: white;
    }
    .progress-controls md-progress-circle, .progress-controls button {
      position: absolute;
      left: 50%;
      top: 50%;
    }
    .progress-controls md-progress-circle {
      margin-left: -50px;
      margin-top: -50px;
    }
    .progress-controls button {
      margin-left: -27px;
      margin-top: -27px;
      background-color: rgba(255, 255, 255, 0.2);
    }
    .progress-controls >>> path {
      stroke: rgba(255, 255, 255, 0.2) !important;
    }

  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlayerComponent implements OnChanges {
  panControl = new FormControl(0);
  gainControl = new FormControl(1);

  @Input() playerState: PlayerState;
  @Input() playerIndex: number;
  @Input() availableWidth: number;
  @Input() availableHeight: number;

  @Output() panChange = this.panControl.valueChanges;
  @Output() gainChange = this.gainControl.valueChanges;

  constructor(private time: TimeService,
              private store: Store<AppState>) {
  }

  ngOnChanges() {
    this.panControl.setValue(this.playerState.pan, {emitEvent: false});
    this.gainControl.setValue(this.playerState.gain, {emitEvent: false});
  }

  isPlaying() {
    return this.playerState.moduleIndex >= 0;
  }

  advance() {
    this.store.dispatch({type: ADVANCE, payload: this.playerState.player.instrument});
  }

}
