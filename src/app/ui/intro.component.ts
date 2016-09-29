import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'in-c-intro',
  template: `
    <div>
      <p>
        Play your own unique version of
        <a href="https://en.wikipedia.org/wiki/In_C" target="_blank">Terry Riley's "In C"</a>
        with the help of five automated bot performers.
      </p>
      <p>
        Each bot plays the same sequence of 53 short musical phrases.
        Each bot will keep repeating the same phrase until <em>you</em> decide they should move on to the next.
      </p>
      <p>
        Over time, different musical and visual patterns emerge.
      </p>
    </div>
    <button [disabled]="!samplesLoaded"
            (click)="play.next()">
      <span *ngIf="samplesLoaded">Play</span>
      <span *ngIf="!samplesLoaded">Loading...</span>
    </button>
    <p>
      Developed by <a href="https://twitter.com/teropa">@teropa</a>.
      <a href="https://github.com/teropa/in-c">Fork me on GitHub</a>.
    </p>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      justify-content: space-around;
      align-items: center;
    }
    p, button {
      max-width: 760px;
      text-align: center;
    }
    button {
      padding: 1em 5em;
      font-family: 'texgyreadventorbold', sans-serif;
      font-size: 1.5em;
      text-transform: uppercase;
      cursor: pointer;
      background-color: rgba(255, 255, 255, 0.7);
    }
    p {
      font-family: 'texgyreadventorregular', sans-serif;
      color: rgba(255, 255, 255, 0.7);
    }
    a, a:active, a:visited {
      color: rgba(255, 255, 255, 0.7);
    }
  `]
})
export class IntroComponent {
  @Input() samplesLoaded: boolean;
  @Output() play = new EventEmitter();
}