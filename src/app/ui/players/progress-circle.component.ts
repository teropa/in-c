import { ChangeDetectionStrategy, Component, Input } from '@angular/core';


@Component({
  selector: 'in-c-progress-circle',
  template: require('./progress-circle.component.html'),
  styles: [require('./progress-circle.component.css')],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProgressCircleComponent {
  @Input() progress: number;
  @Input() hue = 0;

  getProgressPath() {
    return this.getPath(this.progress);
  }

  getBackgroundPath() {
    return this.getPath(100);
  }

  getPath(progress: number) {
    const center = 51;
    const radius = 40;
    const alpha = 360 * Math.min(progress, 99.99) / 100;
    const a = (90 - alpha) * Math.PI / 180;

    const x = center + radius * Math.cos(a);
    const y = center - radius * Math.sin(a);
    let largeArcFlag: number;
    if (alpha > 180) {
      largeArcFlag = 1;
    } else {
      largeArcFlag = 0;
    }
    return `M${center},${center - radius} A${radius},${radius},0,${largeArcFlag},1,${x},${y}`;
  }

  getStroke() {
    return `hsl(${this.hue}, 75%, 70%)`;
  }
}