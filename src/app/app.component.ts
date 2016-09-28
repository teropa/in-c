import {
  Component,
  OnInit,
  HostListener,
  animate,
  style,
  transition,
  trigger
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { List } from 'immutable';

import { PLAY } from './core/actions';
import { AppState } from './model/app-state.model';
import { PlayerState } from './model/player-state.model';
import { PlayerStats } from './model/player-stats.model';
import { AudioPlayerService } from './audio/audio-player.service';
import { SamplesService } from './audio/samples.service';

@Component({
  selector: 'in-c-app',
  template: `
    <div class="container"
         [style.backgroundImage]="getBackgroundGradient(stats$ | async)">
      <in-c-sound-vis [isPlaying]="playing$ | async"
                      [nowPlaying]="nowPlaying$ | async"
                      [width]="width"
                      [height]="visHeight"
                      [playerCount]="(players$ | async).size"
                      [stats]="stats$ | async">
      </in-c-sound-vis>
      <in-c-title *ngIf="!(playing$ | async)"
                  [@titleTransition]="'in'">
      </in-c-title>
      <in-c-player-controls *ngIf="playing$ | async"
                            [playerStates]="players$ | async"
                            [playerStats]="stats$ | async"
                            [@playerControlsTransition]="'in'">
      </in-c-player-controls>
      <in-c-intro *ngIf="!(playing$ | async)"
                  [samplesLoaded]="samples.samplesLoaded | async"
                  (play)="play()"
                  [@introTransition]="'in'">
      </in-c-intro>
      <in-c-top-bar [paused]="paused$ | async"
                    (pause)="pause()"
                    (resume)="resume()">
      </in-c-top-bar>
    </div>
  `,
  styles: [`
    .container {
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

  ]
})
export class AppComponent implements OnInit {

  playing$ = this.store.select('playing').distinctUntilChanged();
  paused$ = this.store.select('paused').distinctUntilChanged();
  players$ = this.store.select('players');
  nowPlaying$ = this.store.select('nowPlaying');
  stats$ = this.store.select('stats');

  width = 0;
  visHeight = 0;

  constructor(private store: Store<AppState>,
              private audioPlayer: AudioPlayerService,
              private samples: SamplesService,
              private domSanitizer: DomSanitizer) {
  }

  ngOnInit() {
    this.setSize();
  }

  getBackgroundGradient(stats: PlayerStats) {
    const progressDeg = stats.totalProgress * 3.6;
    const progressRad = progressDeg / 180 * Math.PI * 2;
    const xPercent = 50 + Math.sin(progressRad) * 40;
    const yPercent = 50 + Math.cos(progressRad) * 40;
    const grad = `radial-gradient(farthest-corner at ${xPercent}% ${yPercent}%, #434343 0%, #000000 100%)`;
    return this.domSanitizer.bypassSecurityTrustStyle(grad);
  }

  @HostListener('window:resize')
  setSize() {
    this.width = window.innerWidth
    this.visHeight = window.innerHeight;
  }

  play() {
    this.audioPlayer.enableAudioContext();
    this.store.dispatch({type: PLAY});
  }

}
