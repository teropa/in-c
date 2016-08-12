import { Injectable, Inject } from '@angular/core';
import { Observable } from 'rxjs/Observable'; 
import { BEAT, AppState } from './app.reducer';
import { Effect } from '@ngrx/effects';

@Injectable()
export class BeatService {

  constructor(@Inject('bpm') private bpm: number) {
  }

  @Effect() beat$ =
    Observable.interval(60 * 1000 / this.bpm)
      .map(() => ({type: BEAT}));

}