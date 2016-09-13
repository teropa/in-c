import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { List } from 'immutable';

import { PAUSE, RESUME, ADJUST_PAN } from './core/actions';
import { AppState } from './core/app-state.model';
import { PlayerState } from './core/player-state.model';
import { PulseService } from './core/pulse.service';
import { AudioPlayerService } from './audio/audio-player.service';

@Component({
  selector: 'in-c-app',
  template: `
    <div class="container" (click)="audioPlayer.enableAudioContext()">
      <in-c-player *ngFor="let playerState of players$ | async; trackBy: trackPlayer"
                   class="player"
                   [playerState]="playerState"
                   (panChange)="panChange(playerState, $event)">
      </in-c-player>
    </div>
    <in-c-top-bar [paused]="paused$ | async"
                  (pause)="pause()"
                  (resume)="resume()">
    </in-c-top-bar>
  `,
  styles: [`
    .container {
      position: fixed;
      left: 0;
      right: 0;
      top: 30px;
      bottom: 0;

      display: flex;
    }
    .player {
      flex: 1;
    }
  `]
})
export class AppComponent implements OnInit, OnDestroy {

  paused$ = this.store.select('paused').distinctUntilChanged();
  players$ = this.store.select('players');
  nowPlaying$ = this.store.select('nowPlaying');
  stats$ = this.store.select('stats');

  constructor(private store: Store<AppState>,
              private pulse: PulseService,
              private audioPlayer: AudioPlayerService) {
  }

  ngOnInit() {
    this.pulse.onInit();
  }

  ngOnDestroy() {
    this.pulse.onDestroy();
  }

  trackPlayer(index: number, obj: PlayerState): any {
    return obj.player.instrument;
  }

  panChange(playerState: PlayerState, pan: number) {
    this.store.dispatch({type: ADJUST_PAN, payload: {instrument: playerState.player.instrument, pan}});
  }

  pause() {
    this.store.dispatch({type: PAUSE});
  }

  resume() {
    this.store.dispatch({type: RESUME});
  }

}
