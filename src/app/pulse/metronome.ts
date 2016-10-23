import { Observable } from 'rxjs/Observable';

const MetronomeWorker = require('worker!./metronome.worker');

export class Metronome {
  private worker = new MetronomeWorker();
  
  public tick$ = Observable
    .fromEvent(this.worker, 'message')
    .map(() => 'tick');

  start(interval: number) {
    this.worker.postMessage({
      command: 'start',
      interval
    });
  }

  stop() {
    this.worker.terminate();
  }

}