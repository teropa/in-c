import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { INCREMENT, DECREMENT, RESET } from './counter.reducer';

interface AppState {
  counter: number;
}

@Component({
  selector: 'my-app',
  template: `
    <button (click)="increment()">Increment</button>
    <div>Count: {{ counter | async }}</div>
    <button (click)="decrement()">Decrement</button>
  `
})
export class AppComponent {
  counter: Observable<number>;

  constructor(public store: Store<AppState>) {
    this.counter = <Observable<number>>store.select('counter');
  }

  increment() {
    this.store.dispatch({type: INCREMENT});
  }

  decrement() {
    this.store.dispatch({type: DECREMENT});
  }

}
