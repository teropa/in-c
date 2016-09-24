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

@Component({
  selector: 'in-c-sound-vis',
  template: `<canvas #cnvs></canvas>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SoundVisComponent implements OnChanges, OnInit, OnDestroy {
  @Input() width: number;
  @Input() height: number;
  @Input() nowPlaying: List<Sound>;
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;
  private sounds: Sound[] = [];
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
      this.nowPlaying.forEach(s => this.sounds.push(s));
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
    this.context.fillStyle = 'rgba(25, 25, 25, 0.5)';
    this.context.fillRect(0, 0, this.width, this.height);

    const now = this.time.now();

    for (let i = 0 ; i < this.sounds.length ; i++) {
      const sound = this.sounds[i];
      const age = now - sound.attackAt;
      const duration = Math.max(0.2, sound.releaseAt - sound.attackAt);
      if (age < 0 || age > duration * 3) {
        continue;
      }

      const noteHeight = Math.ceil(this.height / sound.coordinates.modulePitchExtent);
      const notePos = sound.coordinates.relativePitch;
      const noteDur = sound.releaseAt - sound.attackAt;
      const soundWidth = (sound.coordinates.soundDuration / sound.coordinates.moduleDuration) * this.width;

      const x = Math.floor((sound.coordinates.relativeStart / sound.coordinates.moduleDuration) * this.width);
      const y = Math.floor(this.height - notePos * noteHeight - noteHeight);
      const alphaFactor = (age - duration) / duration;
      const alpha = Math.min(1, Math.max(0, 1 - alphaFactor));

      let brightness = 50;
      if (sound.velocity === 'medium') {
        brightness = 60;
      } else if (sound.velocity === 'high') {
        brightness = 70;
      }

      this.context.fillStyle = `hsla(${sound.hue}, 75%, ${brightness}%, ${alpha})`;
      (<any>this.context).filter = "blur(1px)";
      this.context.fillRect(x, y, soundWidth, noteHeight);
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