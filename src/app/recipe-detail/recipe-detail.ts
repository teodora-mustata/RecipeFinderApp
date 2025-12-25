import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MealService } from '../services/meal.service';
import { HttpClientModule } from '@angular/common/http';
import { ShoppingListService } from '../services/shopping-list.service';
import { TimerService } from '../services/timer.service';
import { FormsModule } from '@angular/forms';

  @Component({
    selector: 'app-recipe-detail',
    standalone: true,
    imports: [CommonModule, HttpClientModule, FormsModule],
    providers: [MealService],
    templateUrl: './recipe-detail.html',
    styleUrls: ['./recipe-detail.css']
  })
  export class RecipeDetailComponent implements OnInit {
    meal = signal<any | null>(null);
    ingredients = signal<{ ingredient: string, measure: string }[]>([]);
    loading = signal(false);
    timerInput = '';
    timerError = '';

    constructor(
      private route: ActivatedRoute,
      private mealService: MealService,
      private shoppingListService: ShoppingListService,
      private timerService: TimerService
    ) { }

    ngOnInit() {
      const id = this.route.snapshot.paramMap.get('id');
      if (id) this.loadRecipe(id);
    }

    private loadRecipe(id: string) {
      this.loading.set(true);
      this.mealService.getMealById(id).subscribe({
        next: (res: any) => {
          const meal = res.meals?.[0];
          this.meal.set(meal);
          this.ingredients.set(this.extractIngredients(meal));
          this.loading.set(false);
        },
        error: () => this.loading.set(false)
      });
    }

    private extractIngredients(meal: any) {
      const list: { ingredient: string; measure: string }[] = [];
      for (let i = 1; i <= 20; i++) {
        const ing = meal[`strIngredient${i}`];
        const measure = meal[`strMeasure${i}`];
        if (ing && ing.trim()) list.push({ ingredient: ing, measure: measure || '' });
      }
      return list;
    }

    addToShoppingList() {
      const meal = this.meal();
      if (!meal) return;
      const recipeName = meal.strMeal || 'Recipe';
      const items = this.ingredients().map(i => ({ ingredient: i.ingredient, measure: i.measure }));
      this.shoppingListService.addRecipe(recipeName, items);
    }

    copyShoppingList() {
      const text = this.buildListText();
      if (!text) return;
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(text);
        return;
      }
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }

    downloadShoppingList() {
      const text = this.buildListText();
      if (!text) return;
      const blob = new Blob([text], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'shopping-list.txt';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }

    private buildListText() {
      const items = this.ingredients();
      if (!items.length) return '';
      return items.map(i => {
        const measure = i.measure ? ` (${i.measure})` : '';
        return `- ${i.ingredient}${measure}`;
      }).join('\n');
    }
    setPreset(val: string) {
      this.timerInput = val;
      this.timerError = '';
    }

    startTimer() {
      this.timerError = '';
      const durationMs = this.parseDuration(this.timerInput);
      if (durationMs <= 0) {
        this.timerError = 'Durata invalidă!';
        return;
      }
      const meal = this.meal();
      const label = meal?.strMeal || 'Timer';
      this.timerService.startTimer(label, durationMs, meal?.idMeal, meal?.strMeal);
      this.timerInput = '';
    }

    parseDuration(input: string): number {
      // Accepts ss, mm, mm:ss, hh:mm:ss
      if (!input) return 0;
      const parts = input.split(':').map(p => p.trim()).filter(Boolean);
      let sec = 0;
      if (parts.length === 1) {
        // Only seconds or minutes
        sec = Number(parts[0]);
        if (sec > 60) return sec * 1000; // treat as seconds if < 60, else minutes
        return sec * 60 * 1000;
      }
      if (parts.length === 2) {
        // mm:ss
        const min = Number(parts[0]);
        const s = Number(parts[1]);
        return (min * 60 + s) * 1000;
      }
      if (parts.length === 3) {
        // hh:mm:ss
        const h = Number(parts[0]);
        const min = Number(parts[1]);
        const s = Number(parts[2]);
        return (h * 3600 + min * 60 + s) * 1000;
      }
      return 0;
    }
  }
