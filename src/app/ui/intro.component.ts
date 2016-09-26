import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'in-c-intro',
  template: `
    <p>
      Play your own unique performance of
      <a href="https://en.wikipedia.org/wiki/In_C" target="_blank">"In C"</a>
      with five automated bot performers.
    </p>
    <button (click)="play.next()">Play</button>
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
      max-width: 800px;
    }
    button {
      padding: 1em 5em;
      font-family: 'texgyreadventorbold', sans-serif;
      font-size: 1.5em;
      text-transform: uppercase;
      cursor: pointer;
    }
    p {
      font-family: 'texgyreadventorregular', sans-serif;
      color: #f1f1f1;
    }
    a, a:active, a:visited {
      color: #f1f1f1;
    }
  `]
})
export class IntroComponent {
  @Output() play = new EventEmitter();
}