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
import { List } from 'immutable';
import * as Hammer from 'hammerjs';

import { PlaylistItem } from './models';
import { TimeService } from './time.service';

@Component({
  selector: '[in-c-player]',
  template: `
    <svg:circle #circle
                [attr.cx]="getX()"
                cy="100"
                r="50"
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
  @Input() nowPlaying: List<PlaylistItem>;
  @Input() position: number;
  @Input() screenWidth: number;
  @ViewChild('circle') circle: ElementRef;
  notesPlayed = 0;

  constructor(private time: TimeService) {
  }

  getX() {
    const relativeX = (this.position + 1) / 2;
    return relativeX * this.screenWidth;
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

}
