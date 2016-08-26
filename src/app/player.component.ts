import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { PlayerState } from './models';

@Component({
  selector: '[in-c-player]',
  template: `
    <svg:circle cx="100" cy="100" r="50"></svg:circle>
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

}
