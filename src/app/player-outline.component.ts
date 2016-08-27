import {
  Component,
  Input,
} from '@angular/core';

import { MIN_GAIN_ADJUST, MAX_GAIN_ADJUST } from './app.reducer';

const MAX_RADIUS = 500;
const MIN_RADIUS = 10;

@Component({
  selector: '[in-c-player-outline]',
  template: `
    <svg:circle #circle
                [attr.cx]="getX()"
                [attr.cy]="getY()"
                [attr.r]="getRadius()">
    </svg:circle>
  `,
  styles: [`
    circle {
      stroke: black;
      stroke-width: 4;
      fill: none;
    }
  `]
})
export class PlayerOutlineComponent {
  @Input() pan: number;
  @Input() gainAdjust: number;
  @Input() screenWidth: number;
  @Input() y: number;

  getX() {
    const relativeX = (this.pan + 1) / 2;
    return relativeX * this.screenWidth;
  }

  getY() {
    return this.y;
  }

  getRadius() {
    const radiusRange = MAX_RADIUS - MIN_RADIUS;
    const gainRange = MAX_GAIN_ADJUST - MIN_GAIN_ADJUST;
    const relativeGain = (this.gainAdjust - MIN_GAIN_ADJUST) / gainRange;
    return MIN_RADIUS + radiusRange * relativeGain;
  }


}
