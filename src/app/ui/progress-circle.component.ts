import { ChangeDetectionStrategy, Component, Input } from '@angular/core';


@Component({
  selector: 'in-c-progress-circle',
  template: `
    <svg preserveAspectRatio="xMidYMid meet" viewBox="0 0 100 100">
      <svg:path [attr.d]="getPath()"
                [attr.stroke]="getStroke()">
      </svg:path>
    </svg>
  `,
  styles: [`
    svg {
      width: 100px;
      height: 100px;
    }
    path {
      stroke-width: 10;
      transition: all 0.5s ease;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProgressCircleComponent {
  @Input() progress: number;
  @Input() hue = 0;

  getPath() {
    const center = 50;
    const radius = 40;
    const alpha = 360 * Math.min(this.progress, 99.99) / 100;
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