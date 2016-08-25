import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { List } from 'immutable';
import { AppState, PlayerState } from './models';
import { PulseService } from './pulse.service';

@Component({
  selector: 'in-c-app',
  template: `
    <in-c-player *ngFor="let player of players$ | async; trackBy: trackPlayer"
                 [playerState]=player>
    </in-c-player>
  `
})
export class AppComponent implements OnInit, OnDestroy {

  players$ = this.store.select('players');

  constructor(private store: Store<AppState>,
              private pulse: PulseService) {
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

}
