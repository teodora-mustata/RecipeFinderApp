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
}
