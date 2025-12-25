import { Injectable, signal } from '@angular/core';

export interface Stopwatch {
  id: string;
  label: string;
  recipeId?: string;
  recipeName?: string;
  startedAt: number;
  elapsedMs: number;
  running: boolean;
  pausedAt?: number;
}

@Injectable({ providedIn: 'root' })
export class StopwatchService {
  stopwatches = signal<Stopwatch[]>(this.loadStopwatches());
  mainStopwatchId = signal<string | null>(this.loadMainStopwatchId());

  private intervalId: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.startInterval();
  }

  startStopwatch(label: string, recipeId?: string, recipeName?: string): string {
    const id = crypto.randomUUID();
    const sw: Stopwatch = {
      id,
      label,
      recipeId,
      recipeName,
      startedAt: Date.now(),
      elapsedMs: 0,
      running: true
    };
    this.stopwatches.update(list => [...list, sw]);
    this.setMainStopwatch(id);
    this.save();
    return id;
  }

  pauseStopwatch(id: string) {
    this.stopwatches.update(list =>
      list.map(sw =>
        sw.id === id && sw.running
          ? { ...sw, running: false, pausedAt: Date.now() }
          : sw
      )
    );
    this.save();
  }

  resumeStopwatch(id: string) {
    this.stopwatches.update(list =>
      list.map(sw =>
        sw.id === id && !sw.running
          ? {
              ...sw,
              running: true,
              startedAt: Date.now() - sw.elapsedMs,
              pausedAt: undefined
            }
          : sw
      )
    );
    this.save();
  }

  stopStopwatch(id: string) {
    this.stopwatches.update(list => list.filter(sw => sw.id !== id));
    if (this.mainStopwatchId() === id) this.setMainStopwatch(null);
    this.save();
  }

  setMainStopwatch(id: string | null) {
    this.mainStopwatchId.set(id);
    this.saveMainStopwatchId(id);
  }

  private startInterval() {
    if (this.intervalId) return;
    this.intervalId = setInterval(() => {
      this.stopwatches.update(list =>
        list.map(sw =>
          sw.running
            ? { ...sw, elapsedMs: Date.now() - sw.startedAt }
            : sw
        )
      );
    }, 1000);
  }

  // Persistence
  private save() {
    localStorage.setItem('stopwatches', JSON.stringify(this.stopwatches()));
  }
  private loadStopwatches(): Stopwatch[] {
    try {
      return JSON.parse(localStorage.getItem('stopwatches') || '[]');
    } catch {
      return [];
    }
  }
  private saveMainStopwatchId(id: string | null) {
    localStorage.setItem('mainStopwatchId', id || '');
  }
  private loadMainStopwatchId(): string | null {
    return localStorage.getItem('mainStopwatchId') || null;
  }
}
