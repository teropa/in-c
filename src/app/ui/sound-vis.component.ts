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
import { NoteService } from './note.service';
import { TimeService } from '../core/time.service';

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

  constructor(private time: TimeService, private notes: NoteService) {
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
    this.context.fillStyle = 'rgba(25, 25, 25, 0.5)';
    this.context.fillRect(0, 0, this.width, this.height);

    const now = this.time.now();

    this.sounds.forEach(sound => {
      const age = now - sound.attackAt;
      const duration = sound.releaseAt - sound.attackAt;
      if (age < 0 || age > duration * 2) {
        return;
      }

      const noteHeight = this.height / this.notes.getScaleSize(sound.fromModuleIdx);
      const notePos = this.notes.getNotePositionInScale(sound.note, sound.fromModuleIdx);
      const noteDur = sound.releaseAt - sound.attackAt;

      const y = this.height - notePos * noteHeight - noteHeight;
      const alpha = 1 - age / duration / 2;

      let brightness = 50;
      if (sound.velocity === 'medium') {
        brightness = 60;
      } else if (sound.velocity === 'high') {
        brightness = 70;
      }

      this.context.fillStyle = `hsla(${sound.hue}, 75%, ${brightness}%, ${alpha})`;
      this.context.beginPath();
      (<any>this.context).filter = "blur(1px)";
      this.context.fillRect(0, y, this.width, noteHeight);
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
      if (age > 5) {
        this.sounds.delete(sound);
      }
    });
  }

}