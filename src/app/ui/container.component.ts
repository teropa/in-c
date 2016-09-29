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
  template: require('./container.component.html'),
  styles: [require('./container.component.css')],
  animations: [
    trigger('titleTransition', moveOut('-300px')),
    trigger('introTransition', moveOut('300px')),
    trigger('playerControlsTransition', moveIn('600px', '550ms'))
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


function moveOut(toY: string) {
  return [
    transition('* => void', [
      style({transform: 'translateY(0)'}),
      animate('150ms ease-in', style({transform: `translateY(${toY})`}))
    ])
  ]
}

function moveIn(fromY: string, delay = '0ms') {
  return [
    transition('void => *', [
      style({transform: `translateY(${fromY})`}),
      animate(`150ms ${delay} ease-out`, style({transform: 'translateY(0)'}))
    ])
  ]
}
