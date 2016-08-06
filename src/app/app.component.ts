import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { List } from 'immutable';
import {ADD, REMOVE } from './list.reducer';

interface AppState {
  list: List<string>;
}

@Component({
  selector: 'my-app',
  template: `
    <ul>
      <li *ngFor="let itm of list | async; let idx = index">
        {{ itm }}
        <button (click)="remove(idx)">X</button>
      </li>
    </ul>
    <div>
      <input [(ngModel)]="newItem">
      <button (click)="add()">Add</button>
    </div>
  `
})
export class AppComponent {
  list: Observable<List<string>>;
  newItem = '';

  constructor(public store: Store<AppState>) {
    this.list = <Observable<List<string>>>store.select('list');
  }

  add() {
    this.store.dispatch({type: ADD, payload: this.newItem});
    this.newItem = '';
  }

  remove(idx: number) {
    this.store.dispatch({type: REMOVE, payload: idx});
  }

}
