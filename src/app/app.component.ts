import {
  Component,
  OnInit,
  HostListener,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { List } from 'immutable';

import { advance, play } from './core/actions';
import { AppState } from './model/app-state.model';
import { AudioPlayerService } from './audio/audio-player.service';
import { SamplesService } from './audio/samples.service';

@Component({
  selector: 'in-c-app',
  template: `
    <in-c-container [samplesLoaded]="samples.samplesLoaded | async"
                    [isPlaying]="isPlaying$ | async"
                    [playerStates]="playerStates$ | async"
                    [nowPlaying]="nowPlaying$ | async"
                    [stats]="stats$ | async"
                    [width]="width"
                    [height]="height"
                    (play)="play()"
                    (advancePlayer)="advancePlayer($event)">
    </in-c-container>
  `
})
export class AppComponent implements OnInit {

  isPlaying$ = this.store.select('playing').distinctUntilChanged();
  playerStates$ = this.store.select('players');
  nowPlaying$ = this.store.select('nowPlaying');
  stats$ = this.store.select('stats');

  width = 0;
  height = 0;

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
    this.height = window.innerHeight;
  }

  play() {
    this.audioPlayer.enableAudioContext();
    this.store.dispatch(play());
  }

  advancePlayer(instrument: string) {
    this.store.dispatch(advance(instrument));
  }

}
