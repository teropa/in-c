import { Component, Input } from '@angular/core'
import { List } from 'immutable';
import { PlayerState } from '../model/player-state.model';
import { PlayerStats } from '../model/player-stats.model';

@Component({
  selector: 'in-c-player-controls',
  template: `
    <in-c-player *ngFor="let playerState of playerStates; trackBy: trackPlayerState"
                  [playerState]="playerState"
                  [playerStats]="playerStats">
    </in-c-player>
  `,
  styles: [`
    :host {
      display: flex;
    }
    in-c-player {
      flex: 1;
      box-sizing: border-box;
    }
  `]
})
export class PlayerControlsComponent {
  @Input() playerStates: List<PlayerState>;
  @Input() playerStats: PlayerStats;

  trackPlayerState(index: number, obj: PlayerState): any {
    return obj.player.instrument;
  }

}