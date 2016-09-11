import { Injectable, Inject, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { Store } from '@ngrx/store';
import { Effect, Actions, mergeEffects } from '@ngrx/effects';

import { PAUSE, RESUME } from './actions';
import { AppState } from './app-state.model';

interface FixedAudioContext extends AudioContext {
  suspend(): Promise<void>
  resume(): Promise<void>
}

@Injectable()
export class TimeService implements OnDestroy {
  private subscription: Subscription;

  constructor(@Inject('audioCtx') private audioCtx: FixedAudioContext,
              private store: Store<AppState>,
              private actions: Actions) {
    this.subscription = mergeEffects(this).subscribe(store);
  }

  @Effect({dispatch: false}) pauseResume$ = this.actions
    .ofType(PAUSE, RESUME)
    .withLatestFrom(this.store)
    .do(([_, state]) => this.pauseOrResume(state.paused));

  @Effect({dispatch: false}) init$ = this.store
    .take(1)
    .do(state => this.pauseOrResume(state.paused));

  now() {
    return this.audioCtx.currentTime;
  }

  getMillisecondsTo(t: number) {
    return (t - this.now()) * 1000;
  }

  pauseOrResume(pause: boolean) {
    if (pause) {
      this.audioCtx.suspend();
    } else {
      this.audioCtx.resume();
    }
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

}