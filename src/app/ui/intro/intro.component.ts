import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'in-c-intro',
  template: require('./intro.component.html'),
  styles: [require('./intro.component.css')]
})
export class IntroComponent {
  @Input() samplesLoaded: boolean;
  @Output() play = new EventEmitter();
}