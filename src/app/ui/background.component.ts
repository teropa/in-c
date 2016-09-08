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
import { List, OrderedSet } from 'immutable';
import { Sound } from '../core/sound.model';
import { TimeService } from '../core/time.service';

const RIPPLE_DURATION = 1;

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
  private sounds = OrderedSet<Sound>();
  private animating = false;

  constructor(private time: TimeService) {
  }

  @ViewChild('cnvs') set canvasRef(ref: ElementRef) {
    this.canvas = ref.nativeElement;
    this.context = this.canvas.getContext('2d');
  }

  ngOnInit() {
    this.animating = true;
    this.draw();
  }

  ngOnDestroy() {
    this.animating = false;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['screenWidth'] || changes['screenHeight']) {
      this.setCanvasSize();
    }
    if (changes['nowPlaying']) {
      this.nowPlaying.forEach(sound => {
        const attackDelay = (sound.attackAt - this.time.now()) * 1000;
        const releaseDelay = attackDelay + RIPPLE_DURATION * 1000;
        setTimeout(() => this.sounds = this.sounds.add(sound), attackDelay);
        setTimeout(() => this.sounds = this.sounds.remove(sound), releaseDelay);
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
    this.context.clearRect(0, 0, this.screenWidth, this.screenHeight);
    this.sounds.forEach(sound => {
      const fromRadius = 60 * sound.playerState.advanceFactor;
      const toRadius = fromRadius * 3;
      const age = this.time.now() - sound.attackAt;
      const relativeAge = age / RIPPLE_DURATION;
      if (age < 0) {
        return;
      }
      const x = this.getX(sound.pan);
      const y = this.getY(sound.playerState.y);
      const radius = fromRadius + (toRadius - fromRadius) * Math.sqrt(relativeAge);
      this.context.beginPath();
      this.context.arc(x, y, radius, 0, Math.PI * 2);
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
  
}