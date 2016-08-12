import { Injectable, Inject } from '@angular/core';
import { Observable } from 'rxjs/Observable'; 
import { Action }from '@ngrx/store';
import { Effect } from '@ngrx/effects';
import { PULSE, AppState } from './app.reducer';
import { TimeService } from './time.service';

@Injectable()
export class PulseService {
  private startTime: number;
  private pulseCount = 1;

  @Effect() pulse$ =
    Observable.interval(this.getBeatInterval() * 1000)
      .flatMap(() => this.makePulses());

  constructor(@Inject('bpm') private bpm: number, private time: TimeService) {
    this.startTime = time.now();
  }

  private makePulses() {
    const pulses: Action[] = [];
    while (this.getNextPulseTime() - this.time.now() <= this.getBeatInterval()) {
      this.pulseCount++;
      pulses.push({type: PULSE, payload: this.getNextPulseTime()});
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