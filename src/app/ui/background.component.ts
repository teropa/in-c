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
  selector: 'in-c-background',
  template: `
    <canvas #cnvs></canvas>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BackgroundComponent implements OnChanges, OnInit, OnDestroy {
  @Input() screenWidth: number;
  @Input() screenHeight: number;
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
    if (changes['screenWidth'] || changes['screenHeight']) {
      this.setCanvasSize();
    }
    if (changes['nowPlaying']) {
      this.nowPlaying.forEach(sound => {
        this.sounds.add(sound);
      });
    }
  }

  private setCanvasSize() {
    this.canvas.width = this.screenWidth;
    this.canvas.style.width = `${this.screenWidth}px`;
    this.canvas.height = this.screenHeight;
    this.canvas.style.height = `${this.screenHeight}px`;
  }

  private draw() {
    if (!this.animating) {
      return;
    }
    this.context.fillStyle = 'rgba(255, 255 ,255, 0.9)';
    this.context.fillRect(0, 0, this.screenWidth, this.screenHeight);
    this.sounds.forEach(sound => {
      const age = this.time.now() - sound.attackAt;
      if (age < 0 || age > RIPPLE_DURATION) {
        return;
      }
      const relativeAge = age / RIPPLE_DURATION;
      const noteDuration = sound.releaseAt - sound.attackAt;
      const x = this.getX(sound.pan);
      const y = this.getY(sound.playerState.y);
      const fromRadius = 0;
      const toRadius = 300 * sound.playerState.advanceFactor;
      const radius = fromRadius + (toRadius - fromRadius) * Math.pow(relativeAge, 1/3);
      const rippleWidth = 200 * Math.sqrt(relativeAge) * noteDuration;
      const alpha = Math.max(0, 1 - Math.sqrt(relativeAge));
      const brighness = this.colors.getNoteBrightness(sound.note);

      this.context.lineWidth = Math.floor(rippleWidth);
      this.context.strokeStyle = `hsla(${sound.hue}, 50%, ${brighness}%, ${alpha})`;

      this.context.beginPath();
      this.context.arc(Math.floor(x), Math.floor(y), Math.floor(radius), 0, Math.PI * 2);
      this.context.stroke();
    });
    requestAnimationFrame(() => this.draw());
  }
  
  private getX(pan: number) {
    const relPan = (pan + 1) / 2;
    return relPan * this.screenWidth;
  }

  private getY(playerY: number) {
    const relY = (playerY + 1) / 2;
    return relY * this.screenHeight;
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