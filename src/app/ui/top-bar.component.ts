import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'in-c-top-bar',
  template: `
    <header>
      <button *ngIf="paused" (click)="resume.next()">
        Resume
      </button>
      <button *ngIf="!paused" (click)="pause.next()">
        Pause
      </button>
    </header>
  `,
  styles: [`
    header {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      height: 30px;

      background-color: black;
      color: white;
    }
  `]
})
export class TopBarComponent {
  @Input() paused: boolean;
  @Output() pause = new EventEmitter();
  @Output() resume = new EventEmitter();
}