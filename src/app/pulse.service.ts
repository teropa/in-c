import { Injectable, Inject } from '@angular/core';
import { Observable } from 'rxjs/Observable'; 
import { Effect } from '@ngrx/effects';
import { PULSE, AppState } from './app.reducer';
import { TimeService } from './time.service';

@Injectable()
export class PulseService {
  private startTime: number;
  private pulseCount = 1;

  @Effect()pulse$ =
    Observable.interval(this.getBeatInterval())
      .map(() => this.makePulse());

  constructor(@Inject('bpm') private bpm: number, private time: TimeService) {
    this.startTime = time.now();
  }

  private makePulse() {
    this.pulseCount++;
    const nextTime = this.startTime + this.pulseCount * this.getBeatInterval() / 1000;
    return {type: PULSE, payload: nextTime};
  }

  private getBeatInterval() {
    return 60 * 1000 / this.bpm;
  }

}