import { Component, OnInit, computed, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin, map, of, switchMap } from 'rxjs';
import { FavoritesService } from '../services/favorites.service';

import { CompletedRecipesService } from '../services/completed-recipes.service';
import { MealService } from '../services/meal.service';

type SimilarRecipe = {
    idMeal: string;
    strMeal: string;
    strMealThumb: string;
    score: number;
    matchedIngredients: string[];
};

@Component({
    selector: 'app-similar-recipes',
    standalone: true,
    imports: [CommonModule, RouterLink],
    providers: [MealService],
    templateUrl: './similar-recipes.html',
    styleUrls: ['./similar-recipes.css']
})
export class SimilarRecipesComponent implements OnInit {
    private completedService = inject(CompletedRecipesService);
    private mealService = inject(MealService);

    private favoritesService = inject(FavoritesService);

    isFavorite(id: string): boolean {
        return this.favoritesService.isFavorite(id);
    }

    toggleFavorite(meal: any) {
        this.favoritesService.toggleFavorite(meal);
    }

    loading = signal(false);
    error = signal<string | null>(null);

    suggestions = signal<SimilarRecipe[]>([]);

    topIngredients = signal<string[]>([]);

    private completedRecipeIds = computed(() =>
        new Set(this.completedService.getAll().map(r => r.recipeId))
    );

    ngOnInit() {
        this.loadSimilar();
    }

    loadSimilar() {
        const completed = this.completedService.getAll();
        if (!completed.length) {
            this.suggestions.set([]);
            this.topIngredients.set([]);
            this.error.set('You don\'t have any completed recipes yet. Complete one to get recommendations.');
            return;
        }

        this.loading.set(true);
        this.error.set(null);

        const lookups = completed.map(r => this.mealService.getMealById(r.recipeId));

        forkJoin(lookups).pipe(
            map((responses: any[]) => {

                const freq = new Map<string, number>();
                const completedIngredientSet = new Set<string>();

                for (const res of responses) {
                    const meal = res?.meals?.[0];
                    if (!meal) continue;

                    for (let i = 1; i <= 20; i++) {
                        const ing = (meal[`strIngredient${i}`] || '').trim().toLowerCase();
                        if (!ing) continue;
                        completedIngredientSet.add(ing);
                        freq.set(ing, (freq.get(ing) || 0) + 1);
                    }
                }

                const top = Array.from(freq.entries())
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 10)
                    .map(([ing]) => ing);

                return { completedIngredientSet, top };
            }),

            switchMap(({ completedIngredientSet, top }) => {
                this.topIngredients.set(top);

                if (!top.length) {
                    return of({ completedIngredientSet, candidateIds: [] as string[] });
                }

                const seed = top.slice(0, 6);
                const calls = seed.map(ing =>
                    this.mealService.filterMealsByIngredient(ing).pipe(
                        map((res: any) => ({ ing, list: (res?.meals || []) as any[] }))
                    )
                );

                return forkJoin(calls).pipe(
                    map(mealsByIng => {
                        const hit = new Map<string, { base: any; hits: number }>();

                        for (const { list } of mealsByIng) {
                            for (const m of list) {
                                const id = m.idMeal;
                                if (this.completedRecipeIds().has(id)) continue;

                                const current = hit.get(id);
                                if (!current) hit.set(id, { base: m, hits: 1 });
                                else current.hits += 1;
                            }
                        }

                        const candidateIds = Array.from(hit.entries())
                            .sort((a, b) => b[1].hits - a[1].hits)
                            .slice(0, 30)
                            .map(([id]) => id);

                        return { completedIngredientSet, candidateIds };
                    })
                );
            }),

            switchMap(({ completedIngredientSet, candidateIds }) => {
                if (!candidateIds.length) {
                    return of([] as SimilarRecipe[]);
                }

                const calls = candidateIds.map(id => this.mealService.getMealById(id));
                return forkJoin(calls).pipe(
                    map((responses: any[]) => {
                        const results: SimilarRecipe[] = [];

                        for (const res of responses) {
                            const meal = res?.meals?.[0];
                            if (!meal) continue;

                            const ingredientSet = new Set<string>();
                            for (let i = 1; i <= 20; i++) {
                                const ing = (meal[`strIngredient${i}`] || '').trim().toLowerCase();
                                if (ing) ingredientSet.add(ing);
                            }

                            const matched: string[] = [];
                            for (const ing of ingredientSet) {
                                if (completedIngredientSet.has(ing)) matched.push(ing);
                            }

                            const score = matched.length;

                            if (score >= 2) {
                                results.push({
                                    idMeal: meal.idMeal,
                                    strMeal: meal.strMeal,
                                    strMealThumb: meal.strMealThumb,
                                    score,
                                    matchedIngredients: matched.slice(0, 8)
                                });
                            }
                        }

                        return results
                            .sort((a, b) => b.score - a.score)
                            .slice(0, 24);
                    })
                );
            })
        ).subscribe({
            next: (list) => {
                this.suggestions.set(list);
                this.loading.set(false);

                if (!list.length) {
                    this.error.set('We didn\'t find enough recommendations (try completing more recipes).');
                }
            },
            error: () => {
                this.loading.set(false);
                this.error.set('Error generating recommendations.');
            }
        });
    }

    shuffleSuggestions() {
        const list = [...this.suggestions()];

        for (let i = list.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [list[i], list[j]] = [list[j], list[i]];
        }

        this.suggestions.set(list);
    }


}
