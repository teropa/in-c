import { Component } from '@angular/core';
import { StoreDevtools } from '@ngrx/store-devtools';

@Component({
  selector: 'in-c-dev-controls',
  template: `
    <button (click)="devtools.reset()">Reset</button>
  `,
  styles: [`
    :host {
      position: fixed;
      bottom: 0;
      height: 50px;
      left: 0;
      right : 0;

      background-color: white;
    }
  `]
})
export class DevControlsComponent {

  constructor(private devtools: StoreDevtools) {
  }
  
}