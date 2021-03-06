import { Component, OnInit, OnDestroy } from '@angular/core';
import { List, Range } from 'immutable';
import { Subscription } from 'rxjs/Subscription';
import { Action } from '@ngrx/store';
import { StoreDevtools } from '@ngrx/store-devtools';

import { AppState } from '../model/app-state.model';
import { PlayerState } from '../model/player-state.model';
import { ADVANCE } from '../core/actions';

@Component({
  selector: 'in-c-dev-controls',
  template: `
    <h4>Dev tools</h4>
    <button (click)="devtools.reset()">Reset</button>
    <input type="range"
           [min]="0"
           [max]="100"
           [step]="1"
           [value]="currentProgress$ | async"
           (input)="onProgressChange($event.target.value)">
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
    let currentState: AppState;
    this.devtools.state.take(1).subscribe(s => currentState = s);
    if (newProgress < currentState.stats.totalProgress) {
      this.travelBack(newProgress);
    } else {
      this.travelForward(currentState, newProgress);
    }
  }

  private travelBack(newProgress: number) {
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

  private travelForward(currentState: AppState, newProgress: number) {
    const targetModuleIndex = Math.floor(newProgress * currentState.score.size / 100);
    const actions = currentState.players
      .flatMap(p => this.getPlayerAdvances(p, targetModuleIndex))
      .sortBy(a => a.moduleIdx)
      .map(a => (<Action>{type: ADVANCE, payload: a.instrument}));
    actions.forEach(a => this.devtools.performAction(a));
  }

  private getPlayerAdvances(p: PlayerState, targetModuleIndex: number): List<{instrument: string, moduleIdx: number}> {
    if (p.moduleIndex < targetModuleIndex) {
      return List<{instrument: string, moduleIdx: number}>(Range(p.moduleIndex, targetModuleIndex)
        .map(i => ({instrument: p.player.instrument, moduleIdx: i})));
    } else {
      return List<{instrument: string, moduleIdx: number}>();
    }
  }

}