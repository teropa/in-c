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
import { ColorService } from './color.service';

@Component({
  selector: 'in-c-player',
  template: `
    <h2>Player {{playerIndex + 1}}</h2>
    <h3>{{ playerState.player.instrumentName }}</h3>
    <md-progress-circle mode="determinate" [value]="playerState.progress">
    </md-progress-circle>
    <button (click)="advance()" [disabled]="!playerState.canAdvance">Forward</button>
    <md-slider [formControl]="panControl" min="-1" max="1" step="0.01" class="pan-slider">
    </md-slider>
    <md-slider [formControl]="gainControl" min="0" max="1" step="0.005" class="gain-slider">
    </md-slider>
    <in-c-sound-vis [nowPlaying]="playerState.nowPlaying" [width]="availableWidth - 2" [height]="150">
    </in-c-sound-vis>
  `,
  styles: [`
    .pan-slider >>> .md-slider-track-fill {
      visibility: hidden;
    }
    in-c-sound-vis {
      display: block;
      margin: 1px;
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
              private colors: ColorService,
              private store: Store<AppState>) {
  }

  ngOnChanges() {
    this.panControl.setValue(this.playerState.pan, {emitEvent: false});
    this.gainControl.setValue(this.playerState.gain, {emitEvent: false});
  }

  advance() {
    this.store.dispatch({type: ADVANCE, payload: this.playerState.player.instrument});
  }

}
