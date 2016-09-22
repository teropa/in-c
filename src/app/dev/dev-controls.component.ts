import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { StoreDevtools } from '@ngrx/store-devtools';

import { AppState } from '../core/app-state.model';

@Component({
  selector: 'in-c-dev-controls',
  template: `
    <h4>Dev tools</h4>
    <button (click)="devtools.reset()">Reset</button>
    <input type="range"
           [min]="0"
           [max]="maxProgress$ | async"
           [step]="0.01"
           [value]="currentProgress$ | async"
           (change)="onProgressChange($event.target.value)">
  `,
  styles: [`
    :host {
      position: fixed;
      bottom: 0;
      height: 50px;
      left: 0;
      right : 0;

      display: flex;
      flex-direction: row;
      align-items: center;

      border-top: 1px solid #444;
      background-color: #100;
      color: #aaa;
    }

    h4, input {
      margin: 0 1rem;
    }
    input[type=range] {
      flex: 1
    }
  `]
})
export class DevControlsComponent implements OnInit, OnDestroy {

  maxProgress$ = this.devtools.state
    .map((s: AppState) => s.score.size );
  currentProgress$ = this.devtools.state
    .map((s: AppState) => s.stats.totalProgress );
  
  private stateSubscription: Subscription;
  private actions: {key: number, state: AppState}[];

  constructor(private devtools: StoreDevtools) {
  }

  ngOnInit() {
    this.stateSubscription = this.devtools.liftedState.subscribe(({actionsById, skippedActionIds, stagedActionIds, computedStates }) => {
        this.actions = [];
        for (let i = 0; i < stagedActionIds.length; i++) {
          const actionId = stagedActionIds[i];
          const { state } = computedStates[i];
          this.actions.push({
            key: actionId,
            state
          });
        }
      });
  }

  ngOnDestroy() {
    this.stateSubscription.unsubscribe();
  }

  onProgressChange(newProgress: number) {
    for (let i = this.actions.length - 1 ; i >= 0 ; i--) {
      const action = this.actions[i];
      if (action.state && action.state.stats.totalProgress > newProgress) {
        this.devtools.toggleAction(action.key);
      } else {
        break;
      }
    }
    this.devtools.sweep();
  }

}