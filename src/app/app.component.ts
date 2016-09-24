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
                    [height]="400"
                    [playerCount]="(players$ | async).size"
                    [style.height.px]="400">
    </in-c-sound-vis>
    <div class="player-controls" #container (click)="audioPlayer.enableAudioContext()">
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
    in-c-sound-vis {
      position: fixed;
      left: 0,
      right: 0;
      top: 50px;
      height: 400px;
    }
    .player-controls {
      position: fixed;
      left: 0;
      right: 0;
      top: 450px;
      bottom: 0;

      display: flex;
      background-color: black;
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

  @ViewChild('container') container: ElementRef;
  width = 0;

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
    this.width = this.container.nativeElement.offsetWidth;
  }

  pause() {
    this.store.dispatch({type: PAUSE});
  }

  resume() {
    this.store.dispatch({type: RESUME});
  }

}
