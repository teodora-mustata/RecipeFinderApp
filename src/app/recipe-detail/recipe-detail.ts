import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MealService } from '../services/meal.service';
import { HttpClientModule } from '@angular/common/http';
import { ShoppingListService } from '../services/shopping-list.service';

@Component({
  selector: 'app-recipe-detail',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  providers: [MealService],
  templateUrl: './recipe-detail.html',
  styleUrls: ['./recipe-detail.css']
})
export class RecipeDetailComponent implements OnInit {
  meal = signal<any | null>(null);
  ingredients = signal<{ ingredient: string, measure: string }[]>([]);
  loading = signal(false);

  constructor(
    private route: ActivatedRoute,
    private mealService: MealService,
    private shoppingListService: ShoppingListService
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
}
