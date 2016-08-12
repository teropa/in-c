import { Injectable, Inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { Effect, StateUpdates } from '@ngrx/effects';
import { AppState, BEAT } from './app.reducer';

@Injectable()
export class PlayerService {
  private audioCtx = new AudioContext();

  constructor(private updates$: StateUpdates<AppState>) {
  }

  @Effect() play$ = this.updates$
    .whenAction('BEAT')
    .do(update => this.playState(update.state))
    .filter(() => false);

  private playState(state: AppState) {
    console.log('beating');
  }

}