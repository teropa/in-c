import { Component } from '@angular/core';

@Component({
  selector: 'in-c-title',
  template: `
    <h1>In C</h1>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    h1 {
      flex: 0;
      margin: 0;
      padding: 0;
      text-align: center;
      text-transform: uppercase;
      font-family: 'texgyreadventorregular', sans-serif;
      font-size: 12rem;
      line-height: 10rem;
      color: rgba(255, 255, 255, 0.7);
    }
  `]
})
export class TitleComponent {

}