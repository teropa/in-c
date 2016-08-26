import {
  ChangeDetectionStrategy,
  Component,
  OnChanges,
  SimpleChanges,
  Input,
  animate,
  keyframes,
  style,
  transition,
  trigger
} from '@angular/core';
import { List } from 'immutable';
import { PlaylistItem } from './models';
import { TimeService } from './time.service';

@Component({
  selector: '[in-c-player]',
  template: `
    <svg:circle [attr.cx]="getX()"
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
export class PlayerComponent implements OnChanges {
  @Input() nowPlaying: List<PlaylistItem>;
  @Input() position: number;
  @Input() screenWidth: number;
  notesPlayed = 0;

  constructor(private time: TimeService) {
  }

  getX() {
    const relativeX = (this.position + 1) / 2;
    return relativeX * this.screenWidth;
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
