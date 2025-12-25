import { Component, OnInit, Signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TimerService, Timer } from '../services/timer.service';
import { StopwatchService, Stopwatch } from '../services/stopwatch.service';

@Component({
  selector: 'app-timer-widget',
  standalone: true,
  imports: [CommonModule], // necesar pt *ngIf si *ngFor
  templateUrl: './timer-widget.html',
  styleUrls: ['./timer-widget.css']
})
export class TimerWidgetComponent implements OnInit {
  timers!: Signal<Timer[]>;
  mainTimerId!: Signal<string | null>;
  mainTimer!: Signal<Timer | undefined>;
  stopwatches!: Signal<Stopwatch[]>;
  mainStopwatchId!: Signal<string | null>;
  mainStopwatch!: Signal<Stopwatch | undefined>;

  widgetPosition = { x: 0, y: 0 };
  dragging = false;
  dragOffset = { x: 0, y: 0 };
  initialized = false;

  constructor(private timerService: TimerService, private stopwatchService: StopwatchService) {}

  ngOnInit() {
    this.timers = this.timerService.timers;
    this.mainTimerId = this.timerService.mainTimerId;
    this.mainTimer = computed(() =>
      this.timers().find(t => t.id === this.mainTimerId())
    );

    this.stopwatches = this.stopwatchService.stopwatches;
    this.mainStopwatchId = this.stopwatchService.mainStopwatchId;
    this.mainStopwatch = computed(() =>
      this.stopwatches().find(sw => sw.id === this.mainStopwatchId())
    );
  }

  ngAfterViewInit() {
    if (!this.initialized) {
      this.widgetPosition.x = window.innerWidth - 380;
      this.widgetPosition.y = window.innerHeight - 240;
      this.updateWidgetPosition();
      this.initialized = true;
    }
  }

  getTimeLeft(ms: number) {
    const s = Math.floor(ms / 1000) % 60;
    const m = Math.floor(ms / 1000 / 60) % 60;
    const h = Math.floor(ms / 1000 / 3600);
    return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s
      .toString()
      .padStart(2, '0')}`;
  }

  pause() {
    if (this.mainTimer()) this.timerService.pauseTimer(this.mainTimer()!.id);
    if (this.mainStopwatch()) this.stopwatchService.pauseStopwatch(this.mainStopwatch()!.id);
  }

  resume() {
    if (this.mainTimer()) this.timerService.resumeTimer(this.mainTimer()!.id);
    if (this.mainStopwatch()) this.stopwatchService.resumeStopwatch(this.mainStopwatch()!.id);
  }

  addMinute() {
    if (this.mainTimer()) this.timerService.addTime(this.mainTimer()!.id, 60_000);
  }

  subtractMinute() {
    if (this.mainTimer())
      this.timerService.subtractTime(this.mainTimer()!.id, 60_000);
  }

  close() {
    if (this.mainTimer()) this.timerService.stopTimer(this.mainTimer()!.id);
    if (this.mainStopwatch()) this.stopwatchService.stopStopwatch(this.mainStopwatch()!.id);
  }

  selectTimer(id: string) {
    this.timerService.setMainTimer(id);
    this.stopwatchService.setMainStopwatch(null);
  }

  selectStopwatch(id: string) {
    this.stopwatchService.setMainStopwatch(id);
    this.timerService.setMainTimer(null);
  }

  startDrag(event: MouseEvent) {
    this.dragging = true;
    this.dragOffset = {
      x: event.clientX - this.widgetPosition.x,
      y: event.clientY - this.widgetPosition.y
    };
    document.addEventListener('mousemove', this.onDrag);
    document.addEventListener('mouseup', this.stopDrag);
  }

  onDrag = (event: MouseEvent) => {
    if (!this.dragging) return;
    this.widgetPosition.x = event.clientX - this.dragOffset.x;
    this.widgetPosition.y = event.clientY - this.dragOffset.y;
    this.updateWidgetPosition();
  };

  stopDrag = () => {
    this.dragging = false;
    document.removeEventListener('mousemove', this.onDrag);
    document.removeEventListener('mouseup', this.stopDrag);
  };

  updateWidgetPosition() {
    const widget = document.querySelector('.movable-widget') as HTMLElement;
    if (widget) {
      widget.style.left = this.widgetPosition.x + 'px';
      widget.style.top = this.widgetPosition.y + 'px';
      widget.style.position = 'fixed';
      widget.style.zIndex = '9999';
      widget.style.cursor = this.dragging ? 'grabbing' : 'grab';
    }
  }
}
