import { Injectable, computed, signal } from '@angular/core';

interface FavoriteMeal {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
}

@Injectable({ providedIn: 'root' })
export class FavoritesService {
  private storageKey = 'favoriteMeals';
  private favoritesSignal = signal<FavoriteMeal[]>([]);
  favorites = computed(() => this.favoritesSignal());

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as FavoriteMeal[];
        this.favoritesSignal.set(parsed.filter(m => m.idMeal));
      }
    } catch {
      this.favoritesSignal.set([]);
    }
  }

  private persist() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.favoritesSignal()));
    } catch {
      /* ignore storage errors */
    }
  }

  isFavorite(id: string): boolean {
    return this.favoritesSignal().some(m => m.idMeal === id);
  }

  toggleFavorite(meal: any) {
    if (!meal || !meal.idMeal) return;
    if (this.isFavorite(meal.idMeal)) {
      this.remove(meal.idMeal);
      return;
    }
    const entry: FavoriteMeal = {
      idMeal: meal.idMeal,
      strMeal: meal.strMeal,
      strMealThumb: meal.strMealThumb
    };
    this.favoritesSignal.set([entry, ...this.favoritesSignal()]);
    this.persist();
  }

  remove(id: string) {
    this.favoritesSignal.set(this.favoritesSignal().filter(m => m.idMeal !== id));
    this.persist();
  }
}
