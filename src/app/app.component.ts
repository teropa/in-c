import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { List } from 'immutable';
import { AppState, PlayerState } from './models';
import { PulseService } from './pulse.service';

@Component({
  selector: 'in-c-app',
  template: `
    <div *ngFor="let player of players$ | async">
      {{ player.moduleIndex }}
    </div>
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
    console.log('destroy');
    this.pulse.onDestroy();
  }

}
