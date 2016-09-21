import { Component, ElementRef, OnInit, OnDestroy, HostListener, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { List } from 'immutable';

import { PAUSE, RESUME, ADJUST_PAN, ADJUST_GAIN } from './core/actions';
import { AppState } from './core/app-state.model';
import { PlayerState } from './core/player-state.model';
import { PulseService } from './core/pulse.service';
import { AudioPlayerService } from './audio/audio-player.service';

@Component({
  selector: 'in-c-app',
  template: `
    <div class="container" #container (click)="audioPlayer.enableAudioContext()">
      <in-c-player *ngFor="let playerState of players$ | async; let idx = index; trackBy: trackPlayer"
                   class="player"
                   [playerState]="playerState"
                   [playerIndex]="idx"
                   [availableWidth]="getPlayerWidth(players$ | async)"
                   [availableHeight]="height"
                   (panChange)="panChange(playerState, $event)"
                   (gainChange)="gainChange(playerState, $event)">
      </in-c-player>
    </div>
    <!--in-c-top-bar [paused]="paused$ | async"
                  (pause)="pause()"
                  (resume)="resume()">
    </in-c-top-bar-->
  `,
  styles: [`
    .container {
      position: fixed;
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;

      display: flex;
      background-color: rgb(25, 25, 25)
    }
    .player {
      flex: 1;

      box-sizing: border-box;
    }
    .player:first-child {
      border-left-width: 0;
    }
  `]
})
export class AppComponent implements OnInit, OnDestroy {

  paused$ = this.store.select('paused').distinctUntilChanged();
  players$ = this.store.select('players');
  nowPlaying$ = this.store.select('nowPlaying');
  stats$ = this.store.select('stats');

  @ViewChild('container') container: ElementRef;
  width = 0;
  height = 0;

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

  getPlayerWidth(players: List<PlayerState>) {
    return Math.ceil(this.width / players.size);
  }

  panChange(playerState: PlayerState, pan: number) {
    this.store.dispatch({type: ADJUST_PAN, payload: {instrument: playerState.player.instrument, pan}});
  }

  gainChange(playerState: PlayerState, gain: number) {
    this.store.dispatch({type: ADJUST_GAIN, payload: {instrument: playerState.player.instrument, gain}});
  }

  @HostListener('window:resize')
  setSize() {
    this.width = this.container.nativeElement.offsetWidth;
    this.height = this.container.nativeElement.offsetHeight;
  }


  pause() {
    this.store.dispatch({type: PAUSE});
  }

  resume() {
    this.store.dispatch({type: RESUME});
  }

}
