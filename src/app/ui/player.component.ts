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

import { AppState } from '../core/app-state.model';
import { PlaylistItem } from '../Core/playlist-item.model';
import { ADJUST_GAIN, ADJUST_PAN } from '../core/actions';
import { MIN_GAIN_ADJUST, MAX_GAIN_ADJUST } from '../core/app.reducer';
import { TimeService } from '../core/time.service';
import { ColorService } from './color.service';

const MAX_RADIUS = 100;
const MIN_RADIUS = 10;

@Component({
  selector: 'in-c-player',
  template: `
    <div #circle
         class="circle"
         [style.left.px]="getCenterX() - getRadius()"
         [style.top.px]="getCenterY() - getRadius()"
         [style.width.px]="getRadius() * 2"
         [style.height.px]="getRadius() * 2"
         [@flash]="notesPlayed"
         (wheel)="onWheel($event)">
    </div>
  `,
  styles: [`
    .circle {
      position: absolute;
      background-color: rgba(0, 0, 0, 0.8);
      cursor: move;
      border-radius: 50%;
    }
  `],
  animations: [
    trigger('flash', [
      transition('* => *', animate('500ms ease-out', keyframes([
        style({transform: 'scale(1.1)', offset: 0}),
        style({transform: 'scale(0.95)', offset: 0.2}),
        style({transform: 'scale(1)', offset: 1})
      ])))
    ])
  ]
})
export class PlayerComponent implements OnChanges, AfterViewInit {
  @Input() instrument: string;
  @Input() nowPlaying: List<PlaylistItem>;
  @Input() pan: number;
  @Input() y: number;
  @Input() gainAdjust: number;
  @Input() screenWidth: number;
  @Input() screenHeight: number;
  @ViewChild('circle') circle: ElementRef;
  notesPlayed = 0;
  panOffset = [0, 0];
  hammer: HammerManager;

  constructor(private time: TimeService,
              private colors: ColorService,
              private store: Store<AppState>) {
  }

  getCenterX() {
    return this.getX(this.pan);
  }

  getCenterY() {
    return this.getY(this.y);
  }

  getRadius() {
    return 60;
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
        setTimeout(() => {
          this.notesPlayed++;
        }, playAfter);
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
    this.panOffset = [evt.center.x - this.getCenterX(), evt.center.y - this.getCenterY()];
  }

  onPanMove(evt: HammerInput) {
    const newPan = ((evt.center.x - this.panOffset[0]) / this.screenWidth) * 2 - 1;
    const newY = ((evt.center.y - this.panOffset[1]) / this.screenHeight) * 2 - 1;
    this.store.dispatch({type: ADJUST_PAN, payload: {instrument: this.instrument, pan: newPan, y: newY}});
  }

  private getX(x: number) {
    const relativeX = (x + 1) / 2;
    return relativeX * this.screenWidth;
  }

  getY(y: number ) {
    const relativeY = (y + 1) / 2;
    return relativeY * this.screenHeight;
  }

}
