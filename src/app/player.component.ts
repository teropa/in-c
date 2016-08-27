import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
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
import { ADJUST_GAIN, ADJUST_PAN, MIN_GAIN_ADJUST, MAX_GAIN_ADJUST } from './app.reducer';
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
  @Input() pan: number;
  @Input() gainAdjust: number;
  @Input() screenWidth: number;
  @ViewChild('circle') circle: ElementRef;
  notesPlayed = 0;
  panOffset = 0;
  hammer: HammerManager;

  constructor(private time: TimeService, private store: Store<AppState>) {
  }

  getX() {
    const relativeX = (this.pan + 1) / 2;
    return relativeX * this.screenWidth;
  }

  getRadius() {
    const radiusRange = MAX_RADIUS - MIN_RADIUS;
    const gainRange = MAX_GAIN_ADJUST - MIN_GAIN_ADJUST;
    const relativeGain = (this.gainAdjust - MIN_GAIN_ADJUST) / gainRange;
    return MIN_RADIUS + radiusRange * relativeGain;
  }

  ngAfterViewInit() {
    this.hammer = new Hammer(this.circle.nativeElement);
    this.hammer.on('panstart', evt => this.onPanStart(evt));
    this.hammer.on('panmove', evt => this.onPanMove(evt));
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['nowPlaying']) {
      this.nowPlaying.forEach(item => {
        const playAfter = this.time.getMillisecondsTo(item.attackAt);
        setTimeout(() => this.notesPlayed++, playAfter);
      });
    }
  }

  ngOnDestroy() {
    this.hammer.destroy();
  }

  onWheel(evt: WheelEvent) {
    this.store.dispatch({type: ADJUST_GAIN, payload: {instrument: this.instrument, amount: evt.deltaY}});
    evt.preventDefault();
  }

  onPanStart(evt: HammerInput) {
    this.panOffset = evt.center.x - this.getX();
  }

  onPanMove(evt: HammerInput) {
    const newPan = ((evt.center.x - this.panOffset) / this.screenWidth) * 2 - 1;
    this.store.dispatch({type: ADJUST_PAN, payload: {instrument: this.instrument, pan: newPan}});
  }

}
