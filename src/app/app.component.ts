import { Component, OnInit, OnDestroy, HostListener, ElementRef } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { List } from 'immutable';
import { AppState, PlayerState } from './models';
import { AudioPlayerService } from './audio-player.service';
import { PulseService } from './pulse.service';

@Component({
  selector: 'in-c-app',
  template: `
    <svg [attr.viewBox]="getViewBox()" (click)="audioPlayer.enableAudioContext()">
      <g in-c-player
             *ngFor="let playerState of players$ | async; trackBy: trackPlayer"
             [instrument]=playerState.player.instrument
             [pan]=playerState.pan
             [y]=playerState.y
             [gainAdjust]=playerState.gainAdjust
             [nowPlaying]=playerState.nowPlaying
             [polygon]=playerState.polygon
             [screenWidth]=width
             [screenHeight]=height>
      </g>
    </svg>
  `,
  styles: [`
    :host {
      position: fixed;
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
    }
  `]
})
export class AppComponent implements OnInit, OnDestroy {

  players$ = this.store.select('players');
  width = 0;
  height = 0;

  constructor(private store: Store<AppState>,
              private pulse: PulseService,
              private audioPlayer: AudioPlayerService,
              private elRef: ElementRef) {
  }

  ngOnInit() {
    this.pulse.onInit();
    this.setSize();
  }

  ngOnDestroy() {
    this.pulse.onDestroy();
  }

  @HostListener('window:resize')
  setSize() {
    this.width = this.elRef.nativeElement.offsetWidth;
    this.height = this.elRef.nativeElement.offsetHeight;
  }
  
  getViewBox() {
    return `0 0 ${this.width} ${this.height}`;
  }

  trackPlayer(index: number, obj: PlayerState): any {
    return obj.player.instrument;
  }

}
