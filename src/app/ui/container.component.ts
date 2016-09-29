import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostBinding,
  Input,
  Output,
  animate,
  style,
  transition,
  trigger
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { List } from 'immutable';

import { PlayerState } from '../model/player-state.model';
import { PlayerStats } from '../model/player-stats.model';
import { Sound } from '../model/sound.model';

@Component({
  selector: 'in-c-container',
  template: `
    <in-c-sound-vis [isPlaying]="isPlaying"
                    [nowPlaying]="nowPlaying"
                    [width]="width"
                    [height]="height"
                    [playerCount]="playerStates.size"
                    [stats]="stats">
    </in-c-sound-vis>
    <in-c-title *ngIf="!isPlaying"
                [@titleTransition]="'in'">
    </in-c-title>
    <in-c-intro *ngIf="!isPlaying"
                [samplesLoaded]="samplesLoaded"
                (play)="play.next()"
                [@introTransition]="'in'">
    </in-c-intro>
    <in-c-player-controls *ngIf="isPlaying"
                          [playerStates]="playerStates"
                          [playerStats]="stats"
                          (advancePlayer)="advancePlayer.next($event)"
                          [@playerControlsTransition]="'in'">
    </in-c-player-controls>
  `,
  styles: [`
    :host {
      position: fixed;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
    }
    in-c-title {
      position: fixed;
      left: 0;
      right: 0;
      top: 0;
      height: 61.8%;
    }
    in-c-intro {
      position: fixed;
      left: 0;
      right: 0;
      top: 61.8%;
      bottom: 0;
    }
    in-c-sound-vis, in-c-player-controls {
      position: fixed;
      left: 0;
      right: 0;
      top: 0;
      height: 100%;
    }
  `],
  animations: [
    trigger('titleTransition', [
      transition('* => void', [
        style({transform: 'translateY(0)'}),
        animate('150ms ease-in', style({transform: 'translateY(-300px)'}))
      ])
    ]),
    trigger('introTransition', [
      transition('* => void', [
        style({transform: 'translateY(0)'}),
        animate('150ms ease-in', style({transform: 'translateY(300px)'}))
      ])
    ]),
    trigger('playerControlsTransition', [
      transition('void => *', [
        style({transform: 'translateY(600px)'}),
        animate('150ms 550ms ease-out', style({transform: 'translateY(0)'}))
      ])
    ])
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContainerComponent {
  @Input() samplesLoaded: boolean;
  @Input() isPlaying: boolean;
  @Input() playerStates: List<PlayerState>;
  @Input() nowPlaying: List<Sound>;
  @Input() stats: PlayerStats;
  @Input() width = 0;
  @Input() height = 0;
  
  @Output() play = new EventEmitter();
  @Output() advancePlayer = new EventEmitter();
  
  constructor(private domSanitizer: DomSanitizer) {
  }

  @HostBinding('style.backgroundImage')
  get backgroundGradient() {
    const progressDeg = this.stats.totalProgress * 3.6;
    const progressRad = progressDeg / 180 * Math.PI * 2;
    const xPercent = 50 + Math.sin(progressRad) * 40;
    const yPercent = 50 + Math.cos(progressRad) * 40;
    const grad = `radial-gradient(farthest-corner at ${xPercent}% ${yPercent}%, #434343 0%, #000000 100%)`;
    return this.domSanitizer.bypassSecurityTrustStyle(grad);
  }
  

}
