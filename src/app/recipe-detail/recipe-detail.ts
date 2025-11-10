import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MealService } from '../services/meal.service';
import { HttpClientModule } from '@angular/common/http';

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
    private mealService: MealService
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
}
