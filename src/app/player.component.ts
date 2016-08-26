import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { PlayerState } from './models';

@Component({
  selector: '[in-c-player]',
  template: `
    <svg:circle [attr.cx]="getX()" cy="100" r="50"></svg:circle>
  `,
  styles: [`
    circle {
      fill: white;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlayerComponent {
  @Input() playerState: PlayerState;
  @Input() screenWidth: number;

  getX() {
    const relativeX = (this.playerState.player.position + 1) / 2;
    return relativeX * this.screenWidth;
  }
}
