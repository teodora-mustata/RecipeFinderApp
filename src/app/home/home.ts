import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MealService } from '../services/meal.service';
import { SearchBarComponent } from '../search-bar/search-bar';
import { RouterLink } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { FavoritesService } from '../services/favorites.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, SearchBarComponent, RouterLink, HttpClientModule],
  providers: [MealService],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent implements OnInit {
  meals = signal<any[] | null>(null);
  loadingInitial = signal(false);
  loadingMore = signal(false);
  error = signal<string | null>(null);
  private initialBatch = 12;
  private loadMoreBatch = 12;

  constructor(private mealService: MealService, private favoritesService: FavoritesService) { }

  ngOnInit() {
    this.initialBatch = this.computeInitialBatch();
    this.loadRandomMeals();
  }

  loadRandomMeals() {
    this.loadingInitial.set(true);
    this.error.set(null);
    this.mealService.getRandomMeals(this.initialBatch).subscribe({
      next: (res: any[]) => {
        this.meals.set(res || []);
        this.loadingInitial.set(false);
      },
      error: () => {
        this.error.set('Error while loading random recipes!');
        this.loadingInitial.set(false);
      }
    });
  }

  loadMoreRandom() {
    if (this.loadingMore()) return;
    this.loadingMore.set(true);
    this.error.set(null);
    this.mealService.getRandomMeals(this.loadMoreBatch).subscribe({
      next: (res: any[]) => {
        const current = this.meals() || [];
        this.meals.set([...current, ...(res || [])]);
        this.loadingMore.set(false);
      },
      error: () => {
        this.error.set('Error while loading more recipes!');
        this.loadingMore.set(false);
      }
    });
  }

  onSearch(query: string) {
    this.loadingInitial.set(true);
    this.error.set(null);

    this.mealService.searchMealsByName(query).subscribe({
      next: (res: any) => {
        this.meals.set(res.meals || []);
        if (!res.meals) this.error.set('No recipes found.');
        this.loadingInitial.set(false);
      },
      error: () => {
        this.error.set('Search error!');
        this.loadingInitial.set(false);
      }
    });
  }

  private computeInitialBatch(): number {
    if (typeof window === 'undefined') return 16;
    const cardWidth = 220; 
    const cols = Math.max(2, Math.floor(window.innerWidth / cardWidth));
    const rows = 2;
    const estimate = cols * rows;
    return Math.min(18, Math.max(8, estimate));
  }

  isFavorite(id: string): boolean {
    return this.favoritesService.isFavorite(id);
  }

  toggleFavorite(meal: any) {
    this.favoritesService.toggleFavorite(meal);
  }
}
