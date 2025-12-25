import { Component, OnInit, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TimerService, Timer } from '../services/timer.service';
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

  newLabel = '';
  newDuration = '';
  error = '';

  constructor(private timerService: TimerService) {}

  ngOnInit() {
    this.timers = this.timerService.timers;
    this.mainTimerId = this.timerService.mainTimerId;
  }

  /* =======================
     HELPERS
     ======================= */

  getTimeLeft(ms: number): string {
    const s = Math.floor(ms / 1000) % 60;
    const m = Math.floor(ms / 1000 / 60) % 60;
    const h = Math.floor(ms / 1000 / 3600);
    return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s
      .toString()
      .padStart(2, '0')}`;
  }

  /* =======================
     ACTIONS
     ======================= */

  setMain(id: string) {
    this.timerService.setMainTimer(id);
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

  /* =======================
     CREATE GENERIC TIMER
     ======================= */

  startGenericTimer() {
    this.error = '';

    const ms = this.parseDuration(this.newDuration);

    if (!this.newLabel.trim()) {
      this.error = 'Eticheta este obligatorie!';
      return;
    }

    if (ms <= 0) {
      this.error = 'Durata invalidă!';
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

  /* =======================
     PARSE TIME
     ======================= */

  parseDuration(input: string): number {
    if (!input) return 0;

    const parts = input
      .split(':')
      .map(p => p.trim())
      .filter(Boolean);

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
