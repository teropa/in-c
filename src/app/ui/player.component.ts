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
    <md-progress-circle mode="determinate" [value]="playerState.progress">
    </md-progress-circle>
    <button (click)="advance()">Forward</button>
    <md-slider [formControl]="panControl" min="-1" max="1" step="0.01" class="pan-slider">
    </md-slider>
  `,
  styles: [`
    .pan-slider >>> .md-slider-track-fill {
      visibility: hidden;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlayerComponent implements OnChanges {
  panControl = new FormControl(0);

  @Input() playerState: PlayerState;

  @Output() panChange = this.panControl.valueChanges;

  constructor(private time: TimeService,
              private colors: ColorService,
              private store: Store<AppState>) {
  }

  ngOnChanges() {
    this.panControl.setValue(this.playerState.pan, {emitEvent: false});
  }

  advance() {
    this.store.dispatch({type: ADVANCE, payload: this.playerState.player.instrument});
  }

}
