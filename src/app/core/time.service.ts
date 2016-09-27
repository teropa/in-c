import { Injectable, Inject, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { Store } from '@ngrx/store';
import { Effect, Actions, mergeEffects } from '@ngrx/effects';

import { AppState } from '../model/app-state.model';

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

  now() {
    return this.audioCtx.currentTime;
  }

  getMillisecondsTo(t: number) {
    return (t - this.now()) * 1000;
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

}