import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Store } from '@ngrx/store';

import { AppState } from '../model/app-state.model';
import { Sound } from '../model/sound.model';
import { PULSE } from '../core/actions';
import { TimeService } from '../core/time.service';

var Color = require("color");

const PULSE_DURATION = 150;

@Injectable()
export class LightsService {

  @Effect({dispatch: false}) lights$ = this.actions$
    .ofType(PULSE)
    .withLatestFrom(this.store$)
    .filter(([payload, state]) => state.playing)
    .do(() => this.triggerPulse())
    .do(([payload, state]) => this.triggerSounds(state));

  constructor(private actions$: Actions,
              private store$: Store<AppState>,
              private time: TimeService) {
  }

  // Pulse is full white in the first light
  private triggerPulse() {
    console.log('0 on [255, 255, 255]');
    setTimeout(() => console.log('0 off'), PULSE_DURATION);
  }

  private triggerSounds(state: AppState) {
    state.nowPlaying.forEach(snd => this.triggerSound(snd, state));
  }

  // Sounds are in lights 2-6 with same colors as they are on the screen.
  private triggerSound(sound: Sound, state: AppState) {
    const hue = sound.hue;
    const brightness = this.getBrightness(sound);
    const saturation = 75;
    const rgb = Color().hsl([hue, brightness, saturation]).rgbArray();
    const playerIdx = state.players.findIndex(p => p.player === sound.fromPlayer);
    const lightIdx = playerIdx + 1; // Pulse is first

    const onAt = this.time.getMillisecondsTo(sound.attackAt);
    const offAt = this.time.getMillisecondsTo(sound.releaseAt);

    setTimeout(() => console.log(lightIdx, 'on', rgb), onAt);
    setTimeout(() => console.log(lightIdx, 'off'), offAt);
  }

  private getBrightness(sound: Sound) {
    if (sound.note.velocity === 'medium') {
      return 60;
    } else if (sound.note.velocity === 'high') {
      return 70;
    } else {
      return 50;
    }
  }

}