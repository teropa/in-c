import { Injectable, Inject} from '@angular/core';

@Injectable()
export class TimeService {

  constructor(@Inject('audioCtx') private audioCtx: AudioContext) {
  }

  now() {
    return this.audioCtx.currentTime;
  }

  getMillisecondsTo(t: number) {
    return (t - this.now()) * 1000;
  }

}