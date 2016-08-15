import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { List } from 'immutable';
import { AppState, PlayerState } from './models';

@Component({
  selector: 'in-c-app',
  template: `
    <div *ngFor="let player of players$ | async">
      {{ player.moduleIndex }}
    </div>
  `,
  providers: [ ]
})
export class AppComponent {

  players$ = this.store.select('players');

  constructor(private store: Store<AppState>) {
  }

}
