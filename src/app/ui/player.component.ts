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
    <in-c-sound-vis [nowPlaying]="playerState.nowPlaying" [width]="availableWidth" [height]="450">
    </in-c-sound-vis>
    <div class="progress-controls">
      <md-progress-circle mode="determinate" color="accent" [value]="playerState.progress">
      </md-progress-circle>
      <button md-fab (click)="advance()" [disabled]="!playerState.canAdvance">
        <md-icon *ngIf="!isPlaying()" class="md-24" title="Start">play_arrow</md-icon>
        <md-icon *ngIf="isPlaying()" class="md-24" title="Advance">fast_forward</md-icon>
      </button>
    </div>
    <div class="sound-controls">
      <div class="sound-control">
        <md-icon class="left-label md-24">volume_down</md-icon>
        <md-slider [formControl]="gainControl" min="0" max="1" step="0.005" class="gain-slider">
        </md-slider>
        <md-icon class="right-label md-24">volume_up</md-icon>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: center;
    }
    .progress-controls {
      position: relative;
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
    }
    in-c-sound-vis {
      display: block;
      flex-shrink: 0;
    }
    .pan-slider >>> .md-slider-track-fill {
      visibility: hidden;
    }
    .sound-controls {
      width: 100%;
    }
    .sound-control {
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: #e3e3e3;
    }
    .sound-control md-slider {
      flex-grow: 1;
    }
    .sound-control .left-label, .sound-control .right-label {
      width: 24px;
      height: 24px;
      text-align: center;
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
