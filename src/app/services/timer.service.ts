import { Injectable, signal } from '@angular/core';

export interface Timer {
  id: string;
  label: string;
  recipeId?: string;
  recipeName?: string;
  durationMs: number;
  remainingMs: number;
  state: 'running' | 'paused' | 'finished';
  startedAt: number;
  pausedAt?: number;
  soundNotified: boolean;
}

@Injectable({ providedIn: 'root' })
export class TimerService {
  timers = signal<Timer[]>(this.loadTimers());
  mainTimerId = signal<string | null>(this.loadMainTimerId());

  private intervalId: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.startInterval();
  }


  startTimer(
    label: string,
    durationMs: number,
    recipeId?: string,
    recipeName?: string
  ): string {
    const id = crypto.randomUUID();

    const timer: Timer = {
      id,
      label,
      recipeId,
      recipeName,
      durationMs,
      remainingMs: durationMs,
      state: 'running',
      startedAt: Date.now(),
      soundNotified: false
    };

    this.timers.update((timers: Timer[]) => [...timers, timer]);

    if (!this.mainTimerId()) {
      this.setMainTimer(id);
    }

    this.saveTimers();
    return id;
  }

  stopTimer(id: string) {
    this.timers.update((timers: Timer[]) =>
      timers.filter(t => t.id !== id)
    );

    if (this.mainTimerId() === id) {
      const next = this.timers().length ? this.timers()[0].id : null;
      this.setMainTimer(next);
    }

    this.saveTimers();
  }

  pauseTimer(id: string) {
    this.timers.update((timers: Timer[]) =>
      timers.map((t: Timer) =>
        t.id === id && t.state === 'running'
          ? { ...t, state: 'paused', pausedAt: Date.now() }
          : t
      )
    );

    this.saveTimers();
  }

  resumeTimer(id: string) {
    this.timers.update((timers: Timer[]) =>
      timers.map((t: Timer) => {
        if (t.id === id && t.state === 'paused' && t.pausedAt) {
          return {
            ...t,
            state: 'running',
            startedAt: t.startedAt + (Date.now() - t.pausedAt),
            pausedAt: undefined
          };
        }
        return t;
      })
    );

    this.saveTimers();
  }

  addTime(id: string, ms: number) {
    this.timers.update((timers: Timer[]) =>
      timers.map((t: Timer) =>
        t.id === id
          ? {
              ...t,
              durationMs: t.durationMs + ms,
              remainingMs: t.remainingMs + ms
            }
          : t
      )
    );

    this.saveTimers();
  }

  subtractTime(id: string, ms: number) {
    this.timers.update((timers: Timer[]) =>
      timers.map((t: Timer) =>
        t.id === id
          ? {
              ...t,
              durationMs: Math.max(0, t.durationMs - ms),
              remainingMs: Math.max(0, t.remainingMs - ms)
            }
          : t
      )
    );

    this.saveTimers();
  }

  setMainTimer(id: string | null) {
    this.mainTimerId.set(id);
    this.saveMainTimerId();
  }

  getTimer(id: string): Timer | undefined {
    return this.timers().find(t => t.id === id);
  }


  private startInterval() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    this.intervalId = setInterval(() => {
      let shouldSave = false;

      this.timers.update((timers: Timer[]) =>
        timers.map((t: Timer) => {
          if (t.state === 'running' && t.remainingMs > 0) {
            const remaining = t.remainingMs - 1000;

            if (remaining <= 0) {
              shouldSave = true;
              return {
                ...t,
                remainingMs: 0,
                state: 'finished'
              };
            }

            return { ...t, remainingMs: remaining };
          }

          if (t.state === 'finished' && !t.soundNotified) {
            this.playSound();
            shouldSave = true;
            return { ...t, soundNotified: true };
          }

          return t;
        })
      );

      if (shouldSave) {
        this.saveTimers();
      }
    }, 1000);
  }


  private saveTimers() {
    localStorage.setItem('timers', JSON.stringify(this.timers()));
  }

  private loadTimers(): Timer[] {
    try {
      return JSON.parse(localStorage.getItem('timers') || '[]');
    } catch {
      return [];
    }
  }

  private saveMainTimerId() {
    localStorage.setItem(
      'mainTimerId',
      JSON.stringify(this.mainTimerId())
    );
  }

  private loadMainTimerId(): string | null {
    try {
      return JSON.parse(localStorage.getItem('mainTimerId') || 'null');
    } catch {
      return null;
    }
  }


  private playSound() {
    try {
      const audio = new Audio();
      audio.src =
        'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=';
      audio.play();
    } catch {
      // ignoram erori audio
    }
  }
}
