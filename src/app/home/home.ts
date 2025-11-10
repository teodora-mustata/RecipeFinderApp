import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MealService } from '../services/meal.service';
import { SearchBarComponent } from '../search-bar/search-bar';
import { RouterLink } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

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
  loading = signal(false);
  error = signal<string | null>(null);

  constructor(private mealService: MealService) { }

  ngOnInit() {
    this.loadRandomMeals();
  }

  loadRandomMeals() {
    this.loading.set(true);
    this.mealService.getRandomMeal().subscribe({
      next: (res: any) => {
        this.meals.set(res.meals || []);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Error while loading random recipes!');
        this.loading.set(false);
      }
    });
  }

  onSearch(query: string) {
    this.loading.set(true);
    this.error.set(null);

    this.mealService.searchMealsByName(query).subscribe({
      next: (res: any) => {
        this.meals.set(res.meals || []);
        if (!res.meals) this.error.set('No recipes found.');
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Search error!');
        this.loading.set(false);
      }
    });
  }
}
