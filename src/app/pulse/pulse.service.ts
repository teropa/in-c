import { Injectable, Inject, NgZone, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { Effect, mergeEffects } from '@ngrx/effects';
import { Store, Action } from '@ngrx/store';
import { AppState } from '../model/app-state.model';
import { PLAY, PULSE } from '../core/actions';
import { TimeService } from '../core/time.service';

const MetronomeWorker = require('worker!./metronome.worker');

@Injectable()
export class PulseService implements OnDestroy {
  private startTime: number;

  private metronome = new MetronomeWorker();
  private messages$ = Observable.fromEvent(this.metronome, 'message');

  private storeSubscription: Subscription;
  private pulseCount = 1;

  @Effect({dispatch: false}) init$ = this.store$
    .take(1)
    .do(() => this.start());
  
  @Effect() pulse$ = this.messages$
    .concatMap(() => this.makePulses());

  constructor(@Inject('bpm') private bpm: number,
              private time: TimeService,
              private store$: Store<AppState>,
              private zone: NgZone) {
    this.storeSubscription = mergeEffects(this).subscribe(store$);
  }

  start() {
    this.startTime = this.time.now();
    this.metronome.postMessage({
      command: 'start',
      interval: this.getBeatInterval() * 1000
    });
  }

  ngOnDestroy() {
    this.metronome.terminate();
    this.storeSubscription.unsubscribe();
  }

  private makePulses() {
    const pulses: Action[] = [];
    while (this.getNextPulseTime() - this.time.now() < this.getBeatInterval() * 2) {
      this.pulseCount++;
      pulses.push({type: PULSE, payload: {time: this.getNextPulseTime(), bpm: this.bpm}});
    }
    return pulses;
  }

  private getBeatInterval() {
    return 60 / this.bpm;
  }

  private getNextPulseTime() {
    return this.startTime + this.pulseCount * this.getBeatInterval();
  }

}