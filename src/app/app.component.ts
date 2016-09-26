import {
  Component,
  OnInit,
  HostListener,
  animate,
  style,
  transition,
  trigger
} from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { List } from 'immutable';

import { PLAY, PAUSE, RESUME } from './core/actions';
import { AppState } from './core/app-state.model';
import { PlayerState } from './core/player-state.model';
import { AudioPlayerService } from './audio/audio-player.service';
import { SamplesService } from './audio/samples.service';

@Component({
  selector: 'in-c-app',
  template: `
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
  `,
  styles: [`
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
              private samples: SamplesService) {
  }

  ngOnInit() {
    this.setSize();
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

  pause() {
    this.store.dispatch({type: PAUSE});
  }

  resume() {
    this.store.dispatch({type: RESUME});
  }

}
