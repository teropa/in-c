import { Component, OnInit, OnDestroy, HostListener, ElementRef } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { List } from 'immutable';
import { AppState, PlayerState } from './models';
import { PulseService } from './pulse.service';

@Component({
  selector: 'in-c-app',
  template: `
    <svg [attr.viewBox]="getViewBox()">
      <g in-c-player
             *ngFor="let player of players$ | async; trackBy: trackPlayer"
             [playerState]=player>
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
    console.log(this.width, this.height);
  }
  
  getViewBox() {
    return `0 0 ${this.width} ${this.height}`;
  }

  trackPlayer(index: number, obj: PlayerState): any {
    return obj.player.instrument;
  }

}
