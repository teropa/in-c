import { Component } from '@angular/core';

@Component({
  selector: 'in-c-title',
  template: `
    <h2>Terry Riley's</h2>
    <h1>In C</h1>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    h1, h2 {
      flex: 0;
      margin: 0;
      padding: 0;
      text-align: center;
      text-transform: uppercase;
      font-family: 'texgyreadventorregular', sans-serif;
    }
    h1 {
      font-size: 10rem;
      line-height: 10rem;
      color: #f1f1f1;
    }
    h2 {
      font-size: 3.3rem;
      line-height: 3rem;
      color: #f1f1f1;
    }
  `]
})
export class TitleComponent {

}