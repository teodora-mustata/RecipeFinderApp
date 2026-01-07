import { Component, OnInit, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TimerService, Timer } from '../services/timer.service';
import { StopwatchService, Stopwatch } from '../services/stopwatch.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-timers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './timers.html',
  styleUrls: ['./timers.css']
})
export class TimersComponent implements OnInit {
  timers!: Signal<Timer[]>;
  mainTimerId!: Signal<string | null>;
  stopwatches!: Signal<Stopwatch[]>;
  mainStopwatchId!: Signal<string | null>;

  newLabel = '';
  newDuration = '';
  error = '';

  newSWLabel = '';
  errorSW = '';

  constructor(private timerService: TimerService, private stopwatchService: StopwatchService) {}

  ngOnInit() {
    this.timers = this.timerService.timers;
    this.mainTimerId = this.timerService.mainTimerId;
    this.stopwatches = this.stopwatchService.stopwatches;
    this.mainStopwatchId = this.stopwatchService.mainStopwatchId;
  }

  getTimeLeft(ms: number): string {
    const s = Math.floor(ms / 1000) % 60;
    const m = Math.floor(ms / 1000 / 60) % 60;
    const h = Math.floor(ms / 1000 / 3600);
    return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s
      .toString()
      .padStart(2, '0')}`;
  }

  setMainTimer(id: string) {
    this.timerService.setMainTimer(id);
    this.stopwatchService.setMainStopwatch(null);
  }

  setMainStopwatch(id: string) {
    this.stopwatchService.setMainStopwatch(id);
    this.timerService.setMainTimer(null);
  }

  pause(id: string) {
    this.timerService.pauseTimer(id);
  }

  resume(id: string) {
    this.timerService.resumeTimer(id);
  }

  addMinute(id: string) {
    this.timerService.addTime(id, 60_000);
  }

  subtractMinute(id: string) {
    this.timerService.subtractTime(id, 60_000);
  }

  stop(id: string) {
    this.timerService.stopTimer(id);
  }

  startGenericTimer() {
    this.error = '';
    const ms = this.parseDuration(this.newDuration);
    if (!this.newLabel.trim()) {
      this.error = 'The label is mandatory!';
      return;
    }
    if (ms <= 0) {
      this.error = 'Invalid duration!';
      return;
    }
    this.timerService.startTimer(this.newLabel.trim(), ms);
    this.newLabel = '';
    this.newDuration = '';
  }

  setPreset(val: string) {
    this.newDuration = val;
    this.error = '';
  }

  startGenericStopwatch() {
    this.errorSW = '';
    if (!this.newSWLabel.trim()) {
      this.errorSW = 'The label is mandatory!';
      return;
    }
    this.stopwatchService.startStopwatch(this.newSWLabel.trim());
    this.newSWLabel = '';
  }

  pauseSW(id: string) {
    this.stopwatchService.pauseStopwatch(id);
  }
  resumeSW(id: string) {
    this.stopwatchService.resumeStopwatch(id);
  }
  stopSW(id: string) {
    this.stopwatchService.stopStopwatch(id);
  }

  parseDuration(input: string): number {
    if (!input) return 0;
    const parts = input.split(':').map(p => p.trim()).filter(Boolean);
    if (parts.length === 1) {
      const v = Number(parts[0]);
      return v > 60 ? v * 1000 : v * 60 * 1000;
    }
    if (parts.length === 2) {
      const [m, s] = parts.map(Number);
      return (m * 60 + s) * 1000;
    }
    if (parts.length === 3) {
      const [h, m, s] = parts.map(Number);
      return (h * 3600 + m * 60 + s) * 1000;
    }
    return 0;
  }
}
