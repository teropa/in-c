import { Component, ElementRef, OnInit, OnDestroy, HostListener, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { List } from 'immutable';

import { PAUSE, RESUME } from './core/actions';
import { AppState } from './core/app-state.model';
import { PlayerState } from './core/player-state.model';
import { PulseService } from './core/pulse.service';
import { AudioPlayerService } from './audio/audio-player.service';

@Component({
  selector: 'in-c-app',
  template: `
    <in-c-sound-vis [nowPlaying]="nowPlaying$ | async"
                    [width]="width"
                    [height]="visHeight"
                    [playerCount]="(players$ | async).size">
    </in-c-sound-vis>
    <div class="title">
      <h2>Terry Riley's</h2>
      <h1>In C</h1>
    </div>
    <div class="player-controls" (click)="audioPlayer.enableAudioContext()">
      <in-c-player *ngFor="let playerState of players$ | async; trackBy: trackPlayer"
                   class="player"
                   [playerState]="playerState">
      </in-c-player>
    </div>
    <in-c-top-bar [paused]="paused$ | async"
                  (pause)="pause()"
                  (resume)="resume()">
    </in-c-top-bar>
  `,
  styles: [`
    in-c-sound-vis, .title {
      position: fixed;
      left: 0;
      right: 0;
      top: 0;
      height: 61.8%;
    }
    .title {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    .title h1, .title h2 {
      flex: 0;
      margin: 0;
      padding: 0;
      text-align: center;
      text-transform: uppercase;
      font-family: 'texgyreadventorregular', sans-serif;
    }
    .title h1 {
      font-size: 10rem;
      line-height: 10rem;
      color: #f1f1f1;
    }
    .title h2 {
      font-size: 3.3rem;
      line-height: 3rem;
      color: #f1f1f1;
    }
    .player-controls {
      position: fixed;
      left: 0;
      right: 0;
      top: 61.8%;
      bottom: 0;

      display: flex;
    }
    .player {
      flex: 1;
      box-sizing: border-box;
    }
  `]
})
export class AppComponent implements OnInit, OnDestroy {

  paused$ = this.store.select('paused').distinctUntilChanged();
  players$ = this.store.select('players');
  nowPlaying$ = this.store.select('nowPlaying');
  stats$ = this.store.select('stats');

  width = 0;
  visHeight = 0;

  constructor(private store: Store<AppState>,
              private pulse: PulseService,
              private audioPlayer: AudioPlayerService) {
  }

  ngOnInit() {
    this.pulse.onInit();
    this.setSize();
  }

  ngOnDestroy() {
    this.pulse.onDestroy();
  }

  trackPlayer(index: number, obj: PlayerState): any {
    return obj.player.instrument;
  }

  @HostListener('window:resize')
  setSize() {
    this.width = window.innerWidth
    this.visHeight = window.innerHeight * 0.618;
  }

  pause() {
    this.store.dispatch({type: PAUSE});
  }

  resume() {
    this.store.dispatch({type: RESUME});
  }

}
