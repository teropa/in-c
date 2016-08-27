import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  OnChanges,
  SimpleChanges,
  ViewChild,
  animate,
  keyframes,
  style,
  transition,
  trigger
} from '@angular/core';
import { Store } from '@ngrx/store'; 
import { List } from 'immutable';
import * as Hammer from 'hammerjs';

import { AppState, PlaylistItem } from './models';
import { ADJUST_GAIN, MIN_GAIN_ADJUST, MAX_GAIN_ADJUST } from './app.reducer';
import { TimeService } from './time.service';

const MAX_RADIUS = 500;
const MIN_RADIUS = 10;

@Component({
  selector: '[in-c-player]',
  template: `
    <svg:circle #circle
                [attr.cx]="getX()"
                cy="100"
                [attr.r]="getRadius()"
                (wheel)="onWheel($event)"
                [@flash]="notesPlayed">
    </svg:circle>
  `,
  styles: [`
    circle {
      fill: white;
      opacity: 0.5;
    }
  `],
  animations: [
    trigger('flash', [
      transition('* => *', animate('500ms ease-out', keyframes([
        style({opacity: 0.5, offset: 0}),
        style({opacity: 1, offset: 0.2}),
        style({opacity: 0.5, offset: 1})
      ])))
    ])
  ]
})
export class PlayerComponent implements OnChanges, AfterViewInit {
  @Input() instrument: string;
  @Input() nowPlaying: List<PlaylistItem>;
  @Input() position: number;
  @Input() gainAdjust: number;
  @Input() screenWidth: number;
  @ViewChild('circle') circle: ElementRef;
  notesPlayed = 0;

  constructor(private time: TimeService, private store: Store<AppState>) {
  }

  getX() {
    const relativeX = (this.position + 1) / 2;
    return relativeX * this.screenWidth;
  }

  getRadius() {
    const radiusRange = MAX_RADIUS - MIN_RADIUS;
    const gainRange = MAX_GAIN_ADJUST - MIN_GAIN_ADJUST;
    const relativeGain = (this.gainAdjust - MIN_GAIN_ADJUST) / gainRange;
    return MIN_RADIUS + radiusRange * relativeGain;
  }

  ngAfterViewInit() {
    const hammer = new Hammer(this.circle.nativeElement);
    hammer.get('pinch').set({ enable: true });
    hammer.on('pinch', () => console.log('pnch'));
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['nowPlaying']) {
      this.nowPlaying.forEach(item => {
        const playAfter = this.time.getMillisecondsTo(item.attackAt);
        setTimeout(() => this.notesPlayed++, playAfter);
      });
    }
  }

  onWheel(evt: WheelEvent) {
    this.store.dispatch({type: ADJUST_GAIN, payload: {instrument: this.instrument, amount: evt.deltaY}});
    evt.preventDefault();
  }

}
