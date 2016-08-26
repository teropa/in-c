import {
  ChangeDetectionStrategy,
  Component,
  Input,
  animate,
  state,
  style,
  transition,
  trigger
} from '@angular/core';
import { PlayerState } from './models';

@Component({
  selector: '[in-c-player]',
  template: `
    <svg:circle [attr.cx]="getX()"
                cy="100"
                r="50"
                [@nowPlaying]="isPlaying() ? 'yes' : 'no'">
    </svg:circle>
  `,
  styles: [`
    circle {
      fill: white;
    }
  `],
  animations: [
    trigger('nowPlaying', [
      state('yes', style({opacity: 1})),
      state('no',  style({opacity: 0.5})),
      transition('* => *', animate('1000ms'))
    ])
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlayerComponent {
  @Input() playerState: PlayerState;
  @Input() screenWidth: number;

  playing = true;

  constructor() {
    setTimeout(() => this.playing = false, 1000);
  }
  getX() {
    const relativeX = (this.playerState.player.position + 1) / 2;
    return relativeX * this.screenWidth;
  }

  isPlaying() {
    return this.playing;
  }

}
