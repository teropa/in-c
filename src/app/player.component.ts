import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { PlayerState } from './models';

@Component({
  selector: 'in-c-player',
  template: `
    <div>{{ playerState.moduleIndex }}</div>
  `,
  styles: [`
    :host {
      display: flex;
      flex-flow: center;
      align-items: center;

      width: 100px;
      height: 100px;

      color: white;
      border: 1px solid white;
      border-radius: 50%;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlayerComponent {
  @Input() playerState: PlayerState;

}
