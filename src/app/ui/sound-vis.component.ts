import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import { List } from 'immutable';
import { Sound } from '../core/sound.model';
import { ColorService } from './color.service';
import { TimeService } from '../core/time.service';

const RIPPLE_DURATION = 4;
const CLEANUP_INTERVAL = 10 * 1000;

@Component({
  selector: 'in-c-sound-vis',
  template: `
    <canvas #cnvs></canvas>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SoundVisComponent implements OnChanges, OnInit, OnDestroy {
  @Input() width: number;
  @Input() height: number;
  @Input() nowPlaying: List<Sound>;
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;
  private sounds = new Set<Sound>();
  private animating = false;
  private cleanupInterval: number;

  constructor(private time: TimeService, private colors: ColorService) {
  }

  @ViewChild('cnvs') set canvasRef(ref: ElementRef) {
    this.canvas = ref.nativeElement;
    this.context = this.canvas.getContext('2d');
  }

  ngOnInit() {
    this.animating = true;
    this.draw();
    this.cleanupInterval = window.setInterval(() => this.cleanUp(), CLEANUP_INTERVAL);
  }

  ngOnDestroy() {
    this.animating = false;
    window.clearInterval(this.cleanupInterval);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['width'] || changes['height']) {
      this.setCanvasSize();
    }
    if (changes['nowPlaying']) {
      this.nowPlaying
        //.filterNot(sound => sound.velocity === 'low')
        .forEach(sound => this.sounds.add(sound));
    }
  }

  private setCanvasSize() {
    this.canvas.width = this.width;
    this.canvas.style.width = `${this.width}px`;
    this.canvas.height = this.height;
    this.canvas.style.height = `${this.height}px`;
  }

  private draw() {
    if (!this.animating) {
      return;
    }
    this.context.fillStyle = 'rgba(25, 25, 25, 0.9)';
    this.context.fillRect(0, 0, this.width, this.height);
    this.sounds.forEach(sound => {
      const age = this.time.now() - sound.attackAt;
      if (age < 0 || age > RIPPLE_DURATION) {
        return;
      }
      const relativeAge = age / RIPPLE_DURATION;
      const noteDuration = sound.releaseAt - sound.attackAt;
      const x = this.getX();
      const y = this.getY();
      const fromRadius = 0;
      const toRadius = 100;
      const radius = fromRadius + (toRadius - fromRadius) * Math.pow(relativeAge, 1/3);
      const rippleWidth = 200 * Math.sqrt(relativeAge) * noteDuration;
      const alpha = Math.max(0, 1 - Math.sqrt(relativeAge));
      const brighness = this.colors.getNoteBrightness(sound.note);

      this.context.lineWidth = Math.floor(rippleWidth);
      this.context.strokeStyle = `hsla(${sound.hue}, 75%, ${brighness}%, ${alpha})`;

      this.context.beginPath();
      this.context.arc(Math.floor(x), Math.floor(y), Math.floor(radius), 0, Math.PI * 2);
      this.context.stroke();
    });
    requestAnimationFrame(() => this.draw());
  }
  
  private getX() {
    return this.width / 2;
  }

  private getY() {
    return this.height / 2;
  }
  
  private cleanUp() {
    this.sounds.forEach(sound => {
      const age = this.time.now() - sound.attackAt;
      if (age > RIPPLE_DURATION) {
        this.sounds.delete(sound);
      }
    });
  }

}