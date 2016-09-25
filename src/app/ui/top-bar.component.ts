import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'in-c-top-bar',
  template: `
    <header>
      <!--
      <button md-icon-button *ngIf="paused" (click)="resume.next()">
        <md-icon class="md-24">play_arrow</md-icon>
      </button>
      <button md-icon-button *ngIf="!paused" (click)="pause.next()">
        <md-icon class="md-24">pause</md-icon>
      </button>
      -->
    </header>
  `,
  styles: [`
    header {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      height: 50px;
      padding: 5px;
      box-sizing: border-box;

      color: white;
    }
    h1 {
      margin: 0;
      line-height: 40px;
    }
    button {
      float: right;
    }
  `]
})
export class TopBarComponent {
  @Input() paused: boolean;
  @Output() pause = new EventEmitter();
  @Output() resume = new EventEmitter();
}