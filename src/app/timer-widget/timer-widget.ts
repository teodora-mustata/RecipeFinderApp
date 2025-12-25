import { Component, OnInit, Signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TimerService, Timer } from '../services/timer.service';

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

  constructor(private timerService: TimerService) {}

  ngOnInit() {
    this.timers = this.timerService.timers;
    this.mainTimerId = this.timerService.mainTimerId;

    // computed pentru timerul principal
    this.mainTimer = computed(() =>
      this.timers().find(t => t.id === this.mainTimerId())
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
  }

  resume() {
    if (this.mainTimer()) this.timerService.resumeTimer(this.mainTimer()!.id);
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
  }

  selectTimer(id: string) {
    this.timerService.setMainTimer(id);
  }
}
