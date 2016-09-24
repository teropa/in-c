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
import { TimeService } from '../core/time.service';

const CLEANUP_INTERVAL = 10 * 1000;
const BLUR_FACTOR = 4;

interface SoundBlock {
  attackAt: number,
  duration: number,
  x: number,
  y: number,
  width: number,
  height: number,
  hue: number,
  brightness: number
}

@Component({
  selector: 'in-c-sound-vis',
  template: `<canvas #cnvs></canvas>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SoundVisComponent implements OnChanges, OnInit, OnDestroy {
  @Input() width: number;
  @Input() height: number;
  @Input() playerCount: number;
  @Input() nowPlaying: List<Sound>;
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;
  private sounds: SoundBlock[] = [];
  private animating = false;
  private cleanupInterval: number;

  constructor(private time: TimeService) {
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
      this.nowPlaying.forEach(s => this.sounds.push(this.makeSoundBlock(s)));
    }
  }

  private makeSoundBlock({attackAt, releaseAt, coordinates, velocity, hue, fromPlayer}: Sound) {
    const fullW = this.width / BLUR_FACTOR;
    const w = fullW / this.playerCount;
    const h = this.height / BLUR_FACTOR;
    const noteHeight = Math.ceil(h / coordinates.modulePitchExtent);
    let brightness = 50;
    if (velocity === 'medium') {
      brightness = 60;
    } else if (velocity === 'high') {
      brightness = 70;
    }
    return {
      attackAt,
      duration: Math.max(0.2, releaseAt - attackAt),
      x: Math.floor(w * fromPlayer.index + (coordinates.relativeStart / coordinates.moduleDuration) * w),
      y: Math.floor(h - coordinates.relativePitch * noteHeight - noteHeight),
      width: Math.ceil((coordinates.soundDuration / coordinates.moduleDuration) * w),
      height: Math.ceil(h / coordinates.modulePitchExtent),
      hue,
      brightness
    }
  }

  private setCanvasSize() {
    this.canvas.width = this.width / BLUR_FACTOR;
    this.canvas.style.width = `${this.width}px`;
    this.canvas.height = this.height / BLUR_FACTOR;
    this.canvas.style.height = `${this.height}px`;
  }

  private draw() {
    if (!this.animating) {
      return;
    }
    this.context.fillStyle = 'rgba(25, 25, 25, 0.5)';
    this.context.fillRect(0, 0, this.width, this.height);

    const now = this.time.now();

    for (let i = 0 ; i < this.sounds.length ; i++) {
      const {attackAt, duration, x, y, width, height, hue, brightness} = this.sounds[i];
      const age = now - attackAt;
      if (age < 0 || age > duration * 3) {
        continue;
      }
      const alphaFactor = (age - duration) / duration;
      const alpha = Math.min(1, Math.max(0, 1 - alphaFactor));

      this.context.fillStyle = `hsla(${hue}, 75%, ${brightness}%, ${alpha})`;
      this.context.fillRect(x, y, width, height);
    }
    requestAnimationFrame(() => this.draw());
  }
  
  private cleanUp() {
    for (let i = this.sounds.length - 1 ; i >= 0 ; i--) {
      const age = this.time.now() - this.sounds[i].attackAt;
      if (age > 10) {
        this.sounds.splice(i, 1);
      }
    }
  }

}