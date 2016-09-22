import { Component } from '@angular/core';
import { StoreDevtools } from '@ngrx/store-devtools';

import { AppState } from '../core/app-state.model';

@Component({
  selector: 'in-c-dev-controls',
  template: `
    <button (click)="devtools.reset()">Reset</button>
    <input type="range" [min]="0" [max]="maxProgress$ | async" [value]="currentProgress$ | async">
  `,
  styles: [`
    :host {
      position: fixed;
      bottom: 0;
      height: 50px;
      left: 0;
      right : 0;

      background-color: white;
    }
  `]
})
export class DevControlsComponent {

  maxProgress$ = this.devtools.state
    .map((s: AppState) => s.score.size );
  currentProgress$ = this.devtools.state
    .map((s: AppState) => s.stats.totalProgress );

  constructor(private devtools: StoreDevtools) {
  }

}